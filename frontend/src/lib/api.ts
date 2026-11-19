import type { AiAnalysis, ChatMessage, Language, Report } from '../types';
import { demoAnalyzeImage, demoAssistantReply } from './demoAI';

/**
 * All sensitive AI calls go through the FastAPI backend when VITE_API_URL is
 * configured. The browser never holds a Gemini key. Without a backend, the app
 * falls back to the local demo analyzer and clearly labels its output.
 */
export const API_URL: string | undefined = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  '',
) || undefined;

export const AI_BACKEND_CONFIGURED = Boolean(API_URL);

async function request<T>(path: string, body: unknown, timeoutMs = 25_000): Promise<T> {
  if (!API_URL) throw new Error('Backend not configured');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`AI backend error ${res.status}: ${detail.slice(0, 200)}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export interface AnalyzeResult {
  analysis: AiAnalysis;
  engine: 'gemini' | 'demo';
  backendError?: string;
}

export async function analyzeImage(file: File, dataUrl: string): Promise<AnalyzeResult> {
  if (API_URL) {
    try {
      const payload = {
        image_base64: dataUrl.split(',')[1] ?? '',
        mime_type: file.type || 'image/jpeg',
        filename: file.name,
      };
      const res = await request<{ analysis: AiAnalysis }>('/api/ai/analyze', payload, 45_000);
      return { analysis: res.analysis, engine: res.analysis.source.engine };
    } catch (err) {
      const analysis = await demoAnalyzeImage(file, dataUrl);
      return {
        analysis,
        engine: 'demo',
        backendError: err instanceof Error ? err.message : 'AI backend unreachable',
      };
    }
  }
  const analysis = await demoAnalyzeImage(file, dataUrl);
  return { analysis, engine: 'demo' };
}

export interface ChatResult {
  reply: string;
  engine: 'gemini' | 'demo';
  backendError?: string;
}

export async function askAssistant(
  message: string,
  history: ChatMessage[],
  language: Language,
  reports: Report[],
): Promise<ChatResult> {
  if (API_URL) {
    try {
      const res = await request<{ reply: string }>(
        '/api/ai/chat',
        {
          message,
          language,
          history: history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          context: {
            total_reports: reports.length,
            open_reports: reports.filter((r) => r.status !== 'Resolved').length,
            urgent_reports: reports.filter((r) => r.priority === 'Urgent' && r.status !== 'Resolved').length,
            categories: reports.reduce<Record<string, number>>((acc, r) => {
              acc[r.category] = (acc[r.category] ?? 0) + 1;
              return acc;
            }, {}),
          },
        },
        30_000,
      );
      return { reply: res.reply, engine: 'gemini' };
    } catch (err) {
      return {
        reply: demoAssistantReply(message, history, { reports, language }),
        engine: 'demo',
        backendError: err instanceof Error ? err.message : 'AI backend unreachable',
      };
    }
  }
  await new Promise((r) => setTimeout(r, 650));
  return {
    reply: demoAssistantReply(message, history, { reports, language }),
    engine: 'demo',
  };
}

/** Kept small deliberately: validates an uploaded file before we read it. */
export function validateImageFile(file: File): string | null {
  const maxBytes = 6 * 1024 * 1024;
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!file.type.startsWith('image/')) return 'Please choose an image file (JPG, PNG or WebP).';
  if (!allowed.includes(file.type) && file.type !== 'image/jpg') {
    return 'Unsupported image type. Use JPG, PNG or WebP.';
  }
  if (file.size > maxBytes) return 'Image is larger than 6 MB. Please use a smaller photo.';
  return null;
}

/** Downscale + recompress so images fit comfortably in localStorage in demo mode. */
export async function compressImage(file: File, maxDim = 1280, quality = 0.82): Promise<string> {
  const dataUrl = await readAsDataUrl(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = dataUrl;
    });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    if (scale === 1 && file.size < 700_000) return dataUrl;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return dataUrl;
  }
}

export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}
