import { useState } from 'react';
import { useSearchTopics } from '../api/hooks/search';

function formatPath(path) {
  if (!path?.length) return 'All folders';
  return path.map((segment) => segment.name).join(' / ');
}

export default function MoveTargetPicker({
  title,
  excludeId,
  onSelectFolder,
  onMoveToRoot,
  moveToRootLabel = 'Make root folder',
  onCancel,
  loading = false,
  compact = false,
}) {
  const [query, setQuery] = useState('');
  const { items, searching, error, isActive } = useSearchTopics(query, { excludeId });

  return (
    <div className={`move-target-picker${compact ? ' move-target-picker-compact' : ''}`}>
      {!compact && title && <p className="folder-options-form-title">{title}</p>}
      {onMoveToRoot && (
        <button
          type="button"
          className="move-target-root-btn"
          onClick={onMoveToRoot}
          disabled={loading}
        >
          {moveToRootLabel}
        </button>
      )}
      <input
        className="field"
        placeholder="Search topics…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
        autoFocus
      />
      {searching && <p className="folder-contents-muted">Searching…</p>}
      {error && <p className="error">{error}</p>}
      {!searching && isActive && items.length === 0 && !error && (
        <p className="folder-contents-muted">No topics found.</p>
      )}
      {items.length > 0 && (
        <ul className="move-target-list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="move-target-item"
                onClick={() => onSelectFolder(item)}
                disabled={loading}
              >
                <span className="move-target-name">{item.name}</span>
                <span className="move-target-path">{formatPath(item.path)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="move-target-cancel" onClick={onCancel} disabled={loading}>
        Cancel
      </button>
    </div>
  );
}
