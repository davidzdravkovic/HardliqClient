import useTopicSearch from '../hooks/useTopicSearch';

function formatPath(path) {
  if (!path?.length) return 'All topics';
  return path.map((segment) => segment.name).join(' / ');
}

export default function SearchResults({ query, onSelect, onClose }) {
  const { items, loading, error, hasMore, totalCount, loadMore, isActive, isWaiting, minQueryLength } =
    useTopicSearch(query);

  if (!query.trim()) return null;

  return (
    <div className="dash-search-panel" role="listbox" aria-label="Search results">
      {query.trim().length < minQueryLength && (
        <p className="dash-search-hint">Type at least {minQueryLength} characters to search.</p>
      )}

      {isActive && (isWaiting || (loading && items.length === 0)) && (
        <p className="dash-search-hint">Searching…</p>
      )}

      {error && <p className="dash-search-error">{error}</p>}

      {isActive && !error && items.length === 0 && !loading && !isWaiting && (
        <p className="dash-search-hint">No topics or tasks found.</p>
      )}

      {items.length > 0 && (
        <>
          <p className="dash-search-meta">
            {totalCount} result{totalCount === 1 ? '' : 's'}
          </p>
          <ul className="dash-search-list">
            {items.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <button
                  type="button"
                  className="dash-search-item"
                  role="option"
                  onClick={() => {
                    onSelect(item);
                    onClose?.();
                  }}
                >
                  <span className="dash-search-item-top">
                    <span className={`dash-search-item-type dash-search-item-type-${item.type}`}>
                      {item.type === 'task' ? 'Task' : 'Folder'}
                    </span>
                    <span className="dash-search-item-name">{item.name}</span>
                  </span>
                  <span className="dash-search-item-path">{formatPath(item.path)}</span>
                  {item.type === 'task' && item.description && (
                    <span className="dash-search-item-desc">{item.description}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {isActive && hasMore && (
        <button
          type="button"
          className="dash-search-more"
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  );
}
