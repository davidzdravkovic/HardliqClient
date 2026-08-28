import { useEffect, useState } from 'react';
import { useTaskMutations } from '../hooks/useTaskMutations';
import type { SelectedTask } from '../types/ui/selected';
import { formatDeleteTaskMessage } from '../utils/deleteMessages';
import { buildTaskTimeline } from '../utils/taskDates';
import ConfirmDialog from './ConfirmDialog';
import TaskOptions from './TaskOptions';

type TaskStatusIconProps = {
  status: string | null | undefined;
};

function TaskStatusIcon({ status }: TaskStatusIconProps) {
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

export type TaskDetailProps = {
  task: SelectedTask;
  onTaskPatched?: (patch: Partial<SelectedTask>) => void;
  onLeaveTask?: () => void;
  onError?: (message: string) => void;
};

export default function TaskDetail({
  task,
  onTaskPatched,
  onLeaveTask,
  onError,
}: TaskDetailProps) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    saving,
    dates,
    handleRename,
    handleDescription,
    handleStatus,
    handleMove,
    handleConfirmDelete,
  } = useTaskMutations({
    task,
    onTaskPatched,
    onLeaveTask,
    onError,
  });

  const taskStatus = task.status || 'Pending';
  const canUpdateStatus = taskStatus === 'Pending';
  const timeline = buildTaskTimeline({ ...dates, status: taskStatus });

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

  async function onConfirmDelete() {
    await handleConfirmDelete();
    setDeleteOpen(false);
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
        onConfirm={onConfirmDelete}
        onCancel={() => !saving && setDeleteOpen(false)}
      />
    </>
  );
}
