const TASK_UPDATE_STATUSES = ['Completed', 'Canceled'];

export default function TaskDetail({
  task,
  taskEditMode,
  editDescription,
  editStatus,
  taskSaving,
  canUpdateStatus,
  onEditDescription,
  onUpdateStatus,
  onEditDescriptionChange,
  onEditStatusChange,
  onSaveDescription,
  onSaveStatus,
  onCloseEdit,
  onDeleteClick,
}) {
  const taskStatus = task.status || 'Pending';

  return (
    <section className="task-detail-panel">
      <header className="task-detail-header">
        <div className="task-detail-heading">
          <h2>{task.name}</h2>
          <span className={`status status-${taskStatus.toLowerCase()}`}>{taskStatus}</span>
        </div>
      </header>

      <div className="task-detail-body">
        {taskEditMode !== 'description' && (
          <div className="task-detail-block">
            <p className="task-detail-label">Description</p>
            <p className="task-detail-desc">{task.description || 'No description yet.'}</p>
          </div>
        )}

        {taskEditMode === 'description' && (
          <form className="task-edit" onSubmit={onSaveDescription}>
            <label className="task-edit-label">
              Description
              <textarea
                className="field"
                rows={4}
                value={editDescription}
                onChange={(e) => onEditDescriptionChange(e.target.value)}
                disabled={taskSaving}
                autoFocus
              />
            </label>
            <div className="task-edit-actions">
              <button
                type="submit"
                className="btn btn-task btn-sm"
                disabled={taskSaving || !editDescription.trim()}
              >
                {taskSaving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onCloseEdit}
                disabled={taskSaving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {taskEditMode === 'status' && (
          <form className="task-edit" onSubmit={onSaveStatus}>
            <label className="task-edit-label">
              Status
              <select
                className="field"
                value={editStatus}
                onChange={(e) => onEditStatusChange(e.target.value)}
                disabled={taskSaving}
                autoFocus
              >
                {TASK_UPDATE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <div className="task-edit-actions">
              <button type="submit" className="btn btn-task btn-sm" disabled={taskSaving}>
                {taskSaving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onCloseEdit}
                disabled={taskSaving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {taskEditMode === null && (
        <footer className="task-detail-footer">
          <div className="task-actions task-actions-primary">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onEditDescription}>
              Edit description
            </button>
            {canUpdateStatus && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={onUpdateStatus}>
                Update status
              </button>
            )}
          </div>
          <div className="task-actions task-actions-danger">
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={onDeleteClick}
              disabled={taskSaving}
            >
              Delete task
            </button>
          </div>
        </footer>
      )}
    </section>
  );
}
