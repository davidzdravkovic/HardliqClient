import { FormEvent, useEffect, useRef, useState } from 'react';
import { postAsk } from '../../api/ask';
import type { AskSource } from '../../types/domain/ask';
import type { AskMessage } from '../../types/domain/ask';
import AskLoadingDots from './AskLoadingDots';
import AskMessageBubble from './AskMessageBubble';

function newId() {
  return crypto.randomUUID();
}

type AskChatProps = {
  onSelectSource?: (source: AskSource) => void;
};

export default function AskChat({ onSelectSource }: AskChatProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AskMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages, loading]);

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

  return (
    <div className="ask-root">
      {open && (
        <section className="ask-panel" aria-label="Ask AI">
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
                <p className="ask-panel__empty-title">Explore</p>
                <ul className="ask-panel__hints">
                  <li>What should I prioritize this week?</li>
                  <li>Where am I losing momentum?</li>
                  <li>Give me a smart summary of open work</li>
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

          {error && <p className="ask-panel__error">{error}</p>}

          <form className="ask-panel__form" onSubmit={handleSubmit}>
            <textarea
              className="ask-panel__input"
              rows={3}
              placeholder="Ask for insights, priorities, or a smarter view…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="ask-panel__send btn btn-primary"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
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
