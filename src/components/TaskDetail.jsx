import { useEffect, useState } from 'react';
import { deleteTask, getTopics, patchTask, patchTopic } from '../api';
import { formatDeleteTaskMessage } from '../utils/deleteMessages';
import { buildTaskTimeline } from '../utils/taskDates';
import ConfirmDialog from './ConfirmDialog';
import TaskOptions from './TaskOptions';

function TaskStatusIcon({ status }) {
  const normalized = (status || 'Pending').toLowerCase();
  if (normalized === 'completed') {
    return (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="m8 12 2.5 2.5 5.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (normalized === 'canceled') {
    return (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v4.5l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function mergeTaskDates(task, patch = {}) {
  return {
    createdAt: patch.createdAt ?? task.createdAt,
    completedAt: patch.completedAt ?? task.completedAt,
    canceledAt: patch.canceledAt ?? task.canceledAt,
  };
}

export default function TaskDetail({
  task,
  refresh,
  onTaskPatched,
  onLeaveTask,
  onError,
}) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dates, setDates] = useState(() => mergeTaskDates(task));

  const taskStatus = task.status || 'Pending';
  const canUpdateStatus = taskStatus === 'Pending';
  const timeline = buildTaskTimeline({ ...dates, status: taskStatus });
  const parentId = task.parentId ?? null;

  useEffect(() => {
    setOptionsOpen(false);
    setDeleteOpen(false);
    setDates(mergeTaskDates(task));
  }, [task.id, task.createdAt, task.completedAt, task.canceledAt]);

  useEffect(() => {
    if (dates.createdAt || task.parentId == null) return undefined;

    let cancelled = false;
    getTopics(task.parentId)
      .then((data) => {
        if (cancelled) return;
        const match = (data.items || []).find((item) => item.id === task.id);
        if (!match?.createdAt) return;
        setDates({
          createdAt: match.createdAt,
          completedAt: match.completedAt,
          canceledAt: match.canceledAt,
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [task.id, task.parentId, dates.createdAt]);

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

  function publishTaskPatch(patch) {
    onTaskPatched?.(patch);
    refresh?.(parentId);
    if (patch.createdAt || patch.completedAt || patch.canceledAt) {
      setDates((prev) => mergeTaskDates(prev, patch));
    }
  }

  async function handleRename(name) {
    setSaving(true);
    try {
      const updated = await patchTopic(task.id, { name });
      publishTaskPatch({ name: updated.name });
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
      publishTaskPatch({
        description: updated.description,
        status: updated.status,
        createdAt: updated.createdAt,
        completedAt: updated.completedAt,
        canceledAt: updated.canceledAt,
      });
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
      publishTaskPatch({
        description: updated.description,
        status: updated.status,
        createdAt: updated.createdAt,
        completedAt: updated.completedAt,
        canceledAt: updated.canceledAt,
      });
    } catch (err) {
      onError?.(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleMove(newParentId) {
    const oldParentId = parentId;
    setSaving(true);
    try {
      await patchTopic(task.id, { moveParent: true, parentId: newParentId });
      onLeaveTask?.();
      refresh?.([oldParentId, newParentId], { movedTopicId: task.id });
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
      onLeaveTask?.();
      refresh?.(parentId, { deletedTopicId: task.id });
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
          <aside className="folder-stats-panel task-meta-panel" aria-label="Task timeline">
            <div className={`task-meta-badge task-meta-${taskStatus.toLowerCase()}`}>
              <span className="task-meta-icon">
                <TaskStatusIcon status={taskStatus} />
              </span>
              <span className="task-meta-status-text">{taskStatus}</span>
            </div>

            {timeline.length > 0 ? (
              <dl className="task-timeline">
                {timeline.map((entry) => (
                  <div key={entry.key} className="task-timeline-row">
                    <dt>{entry.label}</dt>
                    <dd>{entry.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="task-meta-caption">Timeline unavailable</p>
            )}
          </aside>

          <header className="folder-workspace-header">
            <div className="folder-workspace-hero">
              <h2 className="folder-workspace-title">{task.name}</h2>
              <p className="folder-workspace-subtitle">Task workspace</p>
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
            <section className="task-workspace-description">
              <p className="task-workspace-label">Description</p>
              <div className="task-workspace-desc-body">
                {task.description?.trim() ? task.description : 'No description yet.'}
              </div>
            </section>
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
