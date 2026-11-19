import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Send, Sparkles, Trash2, X } from 'lucide-react';
import { useApp } from '../store/AppStore';
import { askAssistant } from '../lib/api';
import type { ChatMessage } from '../types';
import { Button } from './ui';

const SUGGESTIONS = [
  'How do I report a pothole?',
  'Summarise the current reports',
  'How is priority calculated?',
  'நீர் கசிவை எப்படி புகார் செய்வது?',
  'What is demo mode?',
];

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi, I'm the PulseWard assistant. I can explain civic issues, guide you through reporting, summarise this dashboard and explain priority estimates — in English or Tamil.\n\nThis workspace is in demo mode, so nothing I report is sent to a real department.",
  at: new Date().toISOString(),
};

export function AssistantPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { language, reports } = useApp();
  const storageKey = 'pulseward.chat.v1';
  const initial = useMemo<ChatMessage[]>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {
      /* ignore */
    }
    return [WELCOME];
  }, []);

  const [messages, setMessages] = usePersistedChat(initial, storageKey);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    try {
      const res = await askAssistant(trimmed, [...messages, userMsg], language, reports);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          at: new Date().toISOString(),
          engine: res.engine,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content:
            "I couldn't reach the assistant service just now. Please try again — the rest of the dashboard keeps working offline.",
          at: new Date().toISOString(),
          engine: 'demo',
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-midnight-950/60 backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed bottom-0 right-0 top-0 z-[100] flex w-full max-w-[430px] flex-col border-l border-white/[0.07] bg-midnight-900/95 shadow-[-30px_0_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:bottom-4 sm:right-4 sm:top-4 sm:rounded-2xl sm:border"
            aria-label="PulseWard AI assistant"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3.5">
              <AssistantOrb size={34} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-white">PulseWard Assistant</p>
                <p className="flex items-center gap-1.5 text-[11px] text-ink-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online · English / தமிழ்
                </p>
              </div>
              <button
                onClick={() => setMessages([{ ...WELCOME, at: new Date().toISOString() }])}
                className="rounded-lg p-2 text-ink-400 transition hover:bg-white/[0.06] hover:text-white"
                title="Clear chat"
                aria-label="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-ink-400 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <ChatBubble key={m.id} message={m} />
              ))}
              {typing && (
                <div className="flex items-end gap-2">
                  <AssistantOrb size={26} />
                  <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.05] px-3.5 py-3">
                    <span className="flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-pulse-sky"
                          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {messages.length <= 2 && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-ink-300 transition hover:border-pulse-sky/40 hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-white/[0.07] p-3"
            >
              <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-midnight-950/60 p-1.5 focus-within:border-pulse-sky/50">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder={language === 'ta' ? 'உங்கள் கேள்வியை எழுதுங்கள்…' : 'Ask about civic issues or this dashboard…'}
                  className="max-h-28 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-ink-100 outline-none placeholder:text-ink-500"
                />
                <Button type="submit" size="sm" loading={typing} disabled={!input.trim()} className="!px-3">
                  {!typing && <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className="mt-2 flex items-center gap-1 text-center text-[10px] text-ink-500 sm:text-left">
                <Sparkles className="h-3 w-3" /> AI estimates — verify before acting. Demo mode doesn't notify any agency.
              </p>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && <AssistantOrb size={26} />}
      <div
        className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
          isUser
            ? 'rounded-br-md bg-gradient-to-br from-pulse-cyan/90 to-pulse-sky/85 text-midnight-950'
            : 'rounded-bl-md border border-white/10 bg-white/[0.05] text-ink-100'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export function AssistantOrb({ size = 40 }: { size?: number }) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'conic-gradient(from 120deg, #22D3EE, #4F7BFF, #8B5CF6, #22D3EE)',
          filter: 'blur(6px)',
          opacity: 0.55,
        }}
      />
      <div className="absolute inset-[3px] grid place-items-center rounded-full border border-white/20 bg-midnight-900">
        <Bot style={{ width: size * 0.45, height: size * 0.45 }} className="text-pulse-sky" />
      </div>
    </div>
  );
}

function usePersistedChat(initial: ChatMessage[], key: string) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(messages.slice(-30)));
    } catch {
      /* ignore */
    }
  }, [messages, key]);
  return [messages, setMessages] as const;
}
