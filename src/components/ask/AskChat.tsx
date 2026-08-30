import { FormEvent, useEffect, useRef, useState } from 'react';
import { postAsk } from '../../api/ask';
import type { AskSource } from '../../types/domain/ask';
import type { AskMessage } from '../../types/domain/ask';
import { useIsMobileSheet } from '../../hooks/useIsMobileSheet';
import AskLoadingDots from './AskLoadingDots';
import AskMessageBubble from './AskMessageBubble';

const ASK_HINTS = [
  'What should I prioritize this week?',
  'Where am I losing momentum?',
  'Summarize my open work',
] as const;

function newId() {
  return crypto.randomUUID();
}

type AskChatProps = {
  onSelectSource?: (source: AskSource) => void;
};

export default function AskChat({ onSelectSource }: AskChatProps) {
  const isMobile = useIsMobileSheet();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AskMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({
        behavior: isMobile ? 'auto' : 'smooth',
        block: 'end',
      });
    }
  }, [open, messages, loading, isMobile]);

  useEffect(() => {
    if (!open || !isMobile) return undefined;

    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = prevOverflow;
    };
  }, [open, isMobile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setError('');
    setInput('');
    setMessages((prev) => [...prev, { id: newId(), role: 'user', text: question }]);
    setLoading(true);

    try {
      const res = await postAsk(question);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: 'assistant',
          text: res.answer,
          sources: res.sources,
          remaining: res.remainingRequestsToday,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ask failed');
    } finally {
      setLoading(false);
    }
  }

  function applyHint(hint: string) {
    setInput(hint);
    inputRef.current?.focus();
  }

  const rootClass = [
    'ask-root',
    open && 'ask-root--open',
    isMobile && 'ask-root--mobile',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      {open && isMobile && (
        <button
          type="button"
          className="ask-backdrop"
          aria-label="Close ask panel"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <section
          className={`ask-panel${isMobile ? ' ask-panel--mobile' : ''}`}
          aria-label="Ask AI"
        >
          {isMobile && <div className="ask-panel__handle" aria-hidden="true" />}

          <header className="ask-panel__header">
            <div className="ask-panel__title-wrap">
              <span className="ask-panel__icon" aria-hidden="true">
                ✦
              </span>
              <div>
                <h2 className="ask-panel__title">Ask AI</h2>
                <p className="ask-panel__subtitle">Dive deeper. Work smarter.</p>
              </div>
            </div>
            <button
              type="button"
              className="ask-panel__close"
              aria-label="Close ask panel"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>

          <div className="ask-panel__messages">
            {messages.length === 0 && (
              <div className="ask-panel__empty">
                <p className="ask-panel__empty-title">Try asking</p>
                <ul className="ask-panel__hints">
                  {ASK_HINTS.map((hint) => (
                    <li key={hint}>
                      <button
                        type="button"
                        className="ask-hint-chip"
                        disabled={loading}
                        onClick={() => applyHint(hint)}
                      >
                        {hint}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {messages.map((msg) => (
              <AskMessageBubble
                key={msg.id}
                message={msg}
                onSelectSource={onSelectSource}
              />
            ))}

            {loading && <AskLoadingDots />}
            <div ref={messagesEndRef} />
          </div>

          <form className="ask-panel__form" onSubmit={handleSubmit}>
            {error && <p className="ask-panel__error">{error}</p>}
            <div className="ask-panel__composer">
              <textarea
                ref={inputRef}
                className="ask-panel__input"
                rows={isMobile ? 2 : 3}
                placeholder="Ask about priorities, stuck tasks, or your week…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                enterKeyHint="send"
              />
              <button
                type="submit"
                className="ask-panel__send btn btn-primary"
                disabled={loading || !input.trim()}
                aria-label="Send question"
              >
                <span className="ask-panel__send-label">Send</span>
                <span className="ask-panel__send-icon" aria-hidden="true">
                  ↑
                </span>
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        className="ask-fab"
        aria-expanded={open}
        aria-label={open ? 'Close ask AI' : 'Open ask AI'}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="ask-fab__glyph" aria-hidden="true">
          ✦
        </span>
        <span className="ask-fab__label">Ask</span>
      </button>
    </div>
  );
}
