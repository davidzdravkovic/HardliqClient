import { useEffect, useState } from 'react';
import { deleteTask, patchTask, patchTopic } from '../api';
import { formatDeleteTaskMessage } from '../utils/deleteMessages';
import ConfirmDialog from './ConfirmDialog';
import TaskOptions from './TaskOptions';

function TaskStatusIcon({ status }) {
  const normalized = (status || 'Pending').toLowerCase();
  if (normalized === 'completed') {
    return (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="m8 12 2.5 2.5 5.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (normalized === 'canceled') {
    return (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v4.5l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function previewText(text, max = 120) {
  if (!text) return 'Task details and actions';
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}

export default function TaskDetail({ task, onTaskUpdated, onTaskDeleted, onTaskMoved, onError }) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const taskStatus = task.status || 'Pending';
  const canUpdateStatus = taskStatus === 'Pending';
  const statusClass = `status status-${taskStatus.toLowerCase()}`;

  useEffect(() => {
    setOptionsOpen(false);
    setDeleteOpen(false);
  }, [task.id]);

  useEffect(() => {
    if (!optionsOpen) return undefined;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [optionsOpen]);

  async function handleRename(name) {
    setSaving(true);
    try {
      const updated = await patchTopic(task.id, { name });
      onTaskUpdated?.({ name: updated.name });
    } catch (err) {
      onError?.(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleDescription(description) {
    setSaving(true);
    try {
      const updated = await patchTask(task.id, { description });
      onTaskUpdated?.({ description: updated.description, status: updated.status });
    } catch (err) {
      onError?.(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(status) {
    setSaving(true);
    try {
      const updated = await patchTask(task.id, { status });
      onTaskUpdated?.({ description: updated.description, status: updated.status });
    } catch (err) {
      onError?.(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleMove(parentId) {
    const oldParentId = task.parentId ?? null;
    setSaving(true);
    try {
      await patchTopic(task.id, { moveParent: true, parentId });
      onTaskMoved?.(parentId, oldParentId);
    } catch (err) {
      onError?.(err.message);
      throw err;
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

  return (
    <>
      {optionsOpen && (
        <button
          type="button"
          className="folder-mobile-backdrop"
          aria-label="Close menu"
          onClick={() => setOptionsOpen(false)}
        />
      )}

      <div className="folder-workspace-layout task-workspace-layout">
        <section className="folder-workspace task-workspace">
          <aside className="folder-stats-panel task-meta-panel" aria-label="Task status">
            <div className={`task-meta-badge task-meta-${taskStatus.toLowerCase()}`}>
              <span className="task-meta-icon">
                <TaskStatusIcon status={taskStatus} />
              </span>
              <span className="task-meta-status-text">{taskStatus}</span>
            </div>
            <p className="task-meta-caption">Current status</p>
          </aside>

          <header className="folder-workspace-header">
            <div className="folder-workspace-hero">
              <div className="task-workspace-title-row">
                <h2 className="folder-workspace-title">{task.name}</h2>
                <span className={statusClass}>{taskStatus}</span>
              </div>
              <p className="folder-workspace-subtitle">{previewText(task.description)}</p>
            </div>
            <div className="folder-workspace-header-actions">
              <TaskOptions
                taskId={task.id}
                taskName={task.name}
                taskDescription={task.description || ''}
                taskStatus={taskStatus}
                canUpdateStatus={canUpdateStatus}
                saving={saving}
                onRename={handleRename}
                onDescription={handleDescription}
                onStatus={handleStatus}
                onMove={handleMove}
                onDeleteClick={() => setDeleteOpen(true)}
                open={optionsOpen}
                onOpenChange={setOptionsOpen}
              />
            </div>
          </header>

          <div className="folder-workspace-controls task-workspace-content">
            <div className="task-workspace-description">
              <p className="task-workspace-label">Description</p>
              <div className="task-workspace-desc-body">
                {task.description?.trim() ? task.description : 'No description yet.'}
              </div>
            </div>
          </div>
        </section>
      </div>

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
