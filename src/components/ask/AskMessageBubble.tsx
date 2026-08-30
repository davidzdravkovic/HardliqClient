import type { AskMessage, AskSource } from '../../types/domain/ask';
import AskAnswerContent from './formatAnswer';
import AskSources from './AskSources';
import { shouldShowSources } from './shouldShowSources';

type AskMessageBubbleProps = {
  message: AskMessage;
  onSelectSource?: (source: AskSource) => void;
};

export default function AskMessageBubble({
  message,
  onSelectSource,
}: AskMessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <article className={`ask-bubble ask-bubble--${message.role}`}>
      {!isUser && <span className="ask-bubble__label">Assistant</span>}

      {isUser ? (
        <p className="ask-bubble__text">{message.text}</p>
      ) : (
        <>
          <AskAnswerContent text={message.text} />
          {shouldShowSources(message.text, message.sources ?? []) && (
            <AskSources sources={message.sources ?? []} onSelectSource={onSelectSource} />
          )}
          {message.remaining !== undefined && message.remaining >= 0 && (
            <footer className="ask-bubble__meta">
              {message.remaining} asks left today
            </footer>
          )}
        </>
      )}
    </article>
  );
}
