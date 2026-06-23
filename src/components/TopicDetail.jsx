export default function TopicDetail({ childType, childrenLoading, onDeleteClick, deleting }) {
  return (
    <section className="main-detail topic-detail-minimal">
      {!childType && !childrenLoading && (
        <p className="muted">Nothing here yet. Add a folder or a task below.</p>
      )}
      <div className="main-detail-actions">
        <button
          type="button"
          className="btn-text-danger"
          onClick={onDeleteClick}
          disabled={deleting}
        >
          Delete folder
        </button>
      </div>
    </section>
  );
}
