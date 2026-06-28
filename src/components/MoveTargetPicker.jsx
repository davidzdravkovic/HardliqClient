import { useEffect, useState } from 'react';
import { searchTopics } from '../api';

function formatPath(path) {
  if (!path?.length) return 'All topics';
  return path.map((segment) => segment.name).join(' / ');
}

export default function MoveTargetPicker({
  title,
  excludeId,
  onSelectFolder,
  onMoveToRoot,
  onCancel,
  loading = false,
  compact = false,
}) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setItems([]);
      setError('');
      return undefined;
    }

    let cancelled = false;
    setSearching(true);
    setError('');

    const timer = setTimeout(() => {
      searchTopics(trimmed, 1, 20)
        .then((data) => {
          if (cancelled) return;
          const folders = (data.items || []).filter(
            (item) => item.type === 'topic' && item.id !== excludeId
          );
          setItems(folders);
        })
        .catch((err) => {
          if (!cancelled) {
            setItems([]);
            setError(err.message);
          }
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, excludeId]);

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
          Move to top level
        </button>
      )}
      <input
        className="field"
        placeholder="Search folders…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
        autoFocus
      />
      {searching && <p className="folder-contents-muted">Searching…</p>}
      {error && <p className="error">{error}</p>}
      {!searching && query.trim().length >= 2 && items.length === 0 && !error && (
        <p className="folder-contents-muted">No folders found.</p>
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
