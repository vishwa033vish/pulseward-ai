import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Languages, Send, Sparkles, Trash2 } from 'lucide-react';
import { useApp } from '../store/AppStore';
import { useDocumentTitle } from '../hooks/usePrefersReducedMotion';
import { AssistantOrb } from '../components/AssistantPanel';
import { Button, Panel, SectionHeading } from '../components/ui';
import { askAssistant } from '../lib/api';
import type { ChatMessage } from '../types';

const STARTERS = [
  'How do I report a pothole?',
  'Summarise the current reports',
  'How is priority calculated?',
  'Which issues are most urgent?',
  'நீர் கசிவை எப்படி புகார் செய்வது?',
  'What is demo mode?',
];

export function AssistantPage() {
  useDocumentTitle('AI Assistant');
  const { reports, language, setLanguage, profile } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello — I'm the PulseWard assistant. Ask me about civic issues, how to file a report, the current demo reports, or how priority is estimated. I reply in English or Tamil.\n\nDemo mode: I don't send anything to a real department.",
      at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [engine, setEngine] = useState<'gemini' | 'demo'>('demo');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed, at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    try {
      const res = await askAssistant(trimmed, [...messages, userMsg], language, reports);
      setEngine(res.engine);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: res.reply, at: new Date().toISOString(), engine: res.engine },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: 'The assistant service is unavailable right now. The rest of the app still works offline.',
          at: new Date().toISOString(),
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeading
        eyebrow="Conversational civic help"
        title="PulseWard AI Assistant"
        description="Natural-language help for residents and staff. Supports English, Tamil and Tanglish input, and knows this dashboard's report data."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="chip transition hover:text-white"
            >
              <Languages className="h-3 w-3" /> {language === 'en' ? 'English' : 'தமிழ்'}
            </button>
            <span className="chip">
              <Bot className="h-3 w-3" /> {engine === 'gemini' ? 'Gemini' : 'Local demo'}
            </span>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Panel className="flex h-[620px] flex-col !p-0">
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
            <AssistantOrb size={32} />
            <div className="flex-1">
              <p className="font-display text-sm font-semibold text-white">Assistant</p>
              <p className="text-[10.5px] text-ink-500">
                {typing ? 'Thinking…' : `Online · ${reports.length} reports in context`}
              </p>
            </div>
            <button
              onClick={() => setMessages((prev) => prev.slice(0, 1))}
              className="rounded-lg p-2 text-ink-400 transition hover:bg-white/[0.06] hover:text-white"
              aria-label="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
                {m.role === 'assistant' && <AssistantOrb size={26} />}
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-md bg-gradient-to-br from-pulse-cyan/90 to-pulse-sky/85 text-midnight-950'
                      : 'rounded-bl-md border border-white/10 bg-white/[0.05] text-ink-100'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-end gap-2">
                <AssistantOrb size={26} />
                <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.05] px-3.5 py-3">
                  <span className="flex gap-1">
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
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="border-t border-white/[0.06] p-3"
          >
            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-midnight-950/60 p-1.5 focus-within:border-pulse-sky/50">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                rows={1}
                placeholder={language === 'ta' ? 'உங்கள் கேள்வியை எழுதுங்கள்…' : 'Ask anything about civic reporting…'}
                className="max-h-28 min-h-[38px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-ink-100 outline-none placeholder:text-ink-500"
              />
              <Button type="submit" size="sm" loading={typing} disabled={!input.trim()} className="!px-3">
                {!typing && <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-2 flex items-center gap-1 text-[10px] text-ink-500">
              <Sparkles className="h-3 w-3" /> AI answers are informational. Verify before acting.
            </p>
          </form>
        </Panel>

        <div className="space-y-3">
          <Panel className="!p-4">
            <p className="panel-title">Suggested questions</p>
            <div className="mt-3 space-y-1.5">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-left text-[11px] text-ink-300 transition hover:border-pulse-sky/30 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </Panel>

          <Panel className="!p-4">
            <p className="panel-title">Context</p>
            <div className="mt-3 space-y-1.5 text-[11px] text-ink-400">
              <p className="flex justify-between"><span>Reports</span><span className="text-ink-200">{reports.length}</span></p>
              <p className="flex justify-between"><span>Open</span><span className="text-ink-200">{reports.filter((r) => r.status !== 'Resolved').length}</span></p>
              <p className="flex justify-between"><span>Urgent open</span><span className="text-ink-200">{reports.filter((r) => r.priority === 'Urgent' && r.status !== 'Resolved').length}</span></p>
              <p className="flex justify-between"><span>Signed in</span><span className="text-ink-200">{profile?.display_name ?? 'Guest'}</span></p>
            </div>
          </Panel>

          <Panel className="!p-4 border-white/[0.06] bg-white/[0.02]">
            <p className="text-[11px] font-medium text-ink-200">Offline-first</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-ink-500">
              Without a configured backend, the assistant uses a bilingual rule-based knowledge base. Connect the FastAPI
              service with a Gemini key for open-ended conversation.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
