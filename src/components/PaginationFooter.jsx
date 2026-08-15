export default function PaginationFooter({
  shown,
  total,
  pageSize,
  loading = false,
  hasMore = false,
  onLoadMore,
  className = '',
  compact = false,
}) {
  if (!total || total <= 0) return null;

  const safeShown = Math.min(shown, total);
  const remaining = Math.max(0, total - safeShown);
  const nextBatch = Math.min(pageSize, remaining);

  if (compact) {
    if (!hasMore) return null;

    return (
      <div className={`pagination-footer pagination-footer-compact${className ? ` ${className}` : ''}`}>
        <span className="pagination-footer-compact-meta">
          {safeShown} of {total} loaded
        </span>
        <button
          type="button"
          className="pagination-footer-btn pagination-footer-btn-compact"
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? 'Loading…' : `Load ${nextBatch} more`}
        </button>
      </div>
    );
  }

  const percent = Math.min(100, Math.round((safeShown / total) * 100));

  return (
    <div className={`pagination-footer${className ? ` ${className}` : ''}`}>
      <div className="pagination-footer-head">
        <span className="pagination-footer-label">
          Showing <strong>{safeShown}</strong> of <strong>{total}</strong>
        </span>
        <span className="pagination-footer-percent">{percent}%</span>
      </div>
      <div
        className="pagination-footer-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${safeShown} of ${total} items loaded`}
      >
        <span className="pagination-footer-fill" style={{ width: `${percent}%` }} />
      </div>
      {hasMore && remaining > 0 && (
        <button
          type="button"
          className="pagination-footer-btn"
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? (
            <span className="pagination-footer-loading">
              <span className="pagination-footer-spinner" aria-hidden="true" />
              Loading…
            </span>
          ) : (
            <>Load {nextBatch} more</>
          )}
        </button>
      )}
      {!hasMore && safeShown >= total && total > pageSize && (
        <p className="pagination-footer-done">All items loaded</p>
      )}
    </div>
  );
}
