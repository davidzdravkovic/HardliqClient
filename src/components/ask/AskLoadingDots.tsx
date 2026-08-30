export default function AskLoadingDots() {
  return (
    <div className="ask-loading" role="status" aria-live="polite">
      <span className="ask-loading__dot" />
      <span className="ask-loading__dot" />
      <span className="ask-loading__dot" />
      <span className="ask-loading__text">Thinking</span>
    </div>
  );
}
