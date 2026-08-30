import type { AskSource } from '../../types/domain/ask';

type AskSourcesProps = {
  sources: AskSource[];
  onSelectSource?: (source: AskSource) => void;
};

export default function AskSources({ sources, onSelectSource }: AskSourcesProps) {
  if (!sources.length) return null;

  return (
    <div className="ask-sources">
      <span className="ask-sources__label">Sources</span>
      <div className="ask-sources__list">
        {sources.map((source) => (
          <button
            key={source.topicId}
            type="button"
            className="ask-sources__chip"
            onClick={() => onSelectSource?.(source)}
            title={`Open task #${source.topicId}`}
          >
            <span className="ask-sources__chip-name">{source.name}</span>
            <span className="ask-sources__chip-id">#{source.topicId}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
