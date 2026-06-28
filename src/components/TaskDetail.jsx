import { useEffect, useState } from 'react';
import { deleteTask, patchTask, patchTopic } from '../api';
import { formatDeleteTaskMessage } from '../utils/deleteMessages';
import ConfirmDialog from './ConfirmDialog';
import MoveTargetPicker from './MoveTargetPicker';

const TASK_UPDATE_STATUSES = ['Completed', 'Canceled'];

export default function TaskDetail({ task, onTaskUpdated, onTaskDeleted, onTaskMoved, onError }) {
  const [editMode, setEditMode] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('Completed');
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  const taskStatus = task.status || 'Pending';
  const canUpdateStatus = taskStatus === 'Pending';

  useEffect(() => {
    setEditMode(null);
    setDeleteOpen(false);
    setMoveOpen(false);
    setEditName(task.name || '');
    setEditDescription(task.description || '');
    setEditStatus(TASK_UPDATE_STATUSES.includes(taskStatus) ? taskStatus : 'Completed');
  }, [task.id, task.name, task.description, taskStatus]);

  function closeEdit() {
    setEditMode(null);
    setEditName(task.name || '');
    setEditDescription(task.description || '');
    setEditStatus(TASK_UPDATE_STATUSES.includes(taskStatus) ? taskStatus : 'Completed');
  }

  async function handleSaveName(e) {
    e.preventDefault();
    const trimmed = editName.trim();
    if (!trimmed || trimmed === task.name) {
      setEditMode(null);
      return;
    }

    setSaving(true);
    try {
      const updated = await patchTopic(task.id, { name: trimmed });
      setEditMode(null);
      onTaskUpdated?.({ name: updated.name });
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDescription(e) {
    e.preventDefault();
    if (!editDescription.trim()) return;

    setSaving(true);
    try {
      const updated = await patchTask(task.id, { description: editDescription.trim() });
      setEditMode(null);
      onTaskUpdated?.({ description: updated.description, status: updated.status });
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveStatus(e) {
    e.preventDefault();

    setSaving(true);
    try {
      const updated = await patchTask(task.id, { status: editStatus });
      setEditMode(null);
      onTaskUpdated?.({ description: updated.description, status: updated.status });
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    setSaving(true);
    try {
      await deleteTask(task.id);
      setDeleteOpen(false);
      onTaskDeleted?.();
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleMoveTask(parentId) {
    setSaving(true);
    try {
      await patchTopic(task.id, { moveParent: true, parentId });
      setMoveOpen(false);
      onTaskMoved?.(parentId);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="task-detail-panel">
        <header className="task-detail-header">
          <div className="task-detail-heading">
            {editMode === 'name' ? (
              <form className="task-edit task-edit-inline" onSubmit={handleSaveName}>
                <input
                  className="field task-edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={saving}
                  autoFocus
                  aria-label="Task name"
                />
                <div className="task-edit-actions">
                  <button
                    type="submit"
                    className="btn btn-task btn-sm"
                    disabled={saving || !editName.trim() || editName.trim() === task.name}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={closeEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <h2>{task.name}</h2>
            )}
            <span className={`status status-${taskStatus.toLowerCase()}`}>{taskStatus}</span>
          </div>
        </header>

        <div className="task-detail-body">
          {editMode !== 'description' && (
            <div className="task-detail-block">
              <p className="task-detail-label">Description</p>
              <p className="task-detail-desc">{task.description || 'No description yet.'}</p>
            </div>
          )}

          {editMode === 'description' && (
            <form className="task-edit" onSubmit={handleSaveDescription}>
              <label className="task-edit-label">
                Description
                <textarea
                  className="field"
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={saving}
                  autoFocus
                />
              </label>
              <div className="task-edit-actions">
                <button
                  type="submit"
                  className="btn btn-task btn-sm"
                  disabled={saving || !editDescription.trim()}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={closeEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {editMode === 'status' && (
            <form className="task-edit" onSubmit={handleSaveStatus}>
              <label className="task-edit-label">
                Status
                <select
                  className="field"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  disabled={saving}
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
                <button type="submit" className="btn btn-task btn-sm" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={closeEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {editMode === null && !moveOpen && (
          <footer className="task-detail-footer">
            <div className="task-actions task-actions-primary">
              <button
                type="button"
                className="task-action-chip"
                onClick={() => {
                  setEditName(task.name || '');
                  setEditMode('name');
                }}
              >
                Rename
              </button>
              <button
                type="button"
                className="task-action-chip"
                onClick={() => setMoveOpen(true)}
              >
                Move
              </button>
              <button
                type="button"
                className="task-action-chip"
                onClick={() => {
                  setEditDescription(task.description || '');
                  setEditMode('description');
                }}
              >
                Description
              </button>
              {canUpdateStatus && (
                <button
                  type="button"
                  className="task-action-chip"
                  onClick={() => {
                    setEditStatus('Completed');
                    setEditMode('status');
                  }}
                >
                  Status
                </button>
              )}
              <button
                type="button"
                className="task-action-chip task-action-chip-danger"
                onClick={() => setDeleteOpen(true)}
                disabled={saving}
              >
                Delete
              </button>
            </div>
          </footer>
        )}

        {moveOpen && (
          <div className="task-detail-move">
            <p className="folder-options-section-label">Move to folder</p>
            <MoveTargetPicker
              excludeId={task.id}
              loading={saving}
              onSelectFolder={(folder) => handleMoveTask(folder.id)}
              onCancel={() => !saving && setMoveOpen(false)}
              compact
            />
          </div>
        )}
      </section>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete task"
        message={formatDeleteTaskMessage(task.name)}
        confirmLabel="Delete task"
        cancelLabel="Cancel"
        loading={saving}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => !saving && setDeleteOpen(false)}
      />
    </>
  );
}
