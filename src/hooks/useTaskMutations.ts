import { useEffect, useState } from 'react';
import { useTopics } from '../api/hooks/topics';
import { useDeleteTaskMutation, usePatchTaskMutation } from '../api/hooks/mutations/tasks';
import { usePatchTopicMutation } from '../api/hooks/mutations/topics';
import type { TaskListItem } from '../types/domain/topics';
import type { SelectedTask } from '../types/ui/selected';

export type UseTaskMutationsOptions = {
  task: SelectedTask;
  onTaskPatched?: (patch: Partial<SelectedTask>) => void;
  onLeaveTask?: () => void;
  onError?: (message: string) => void;
};

export function useTaskMutations({
  task,
  onTaskPatched,
  onLeaveTask,
  onError,
}: UseTaskMutationsOptions) {
  const patchTopicMutation = usePatchTopicMutation();
  const patchTaskMutation = usePatchTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  const [saving, setSaving] = useState(false);
  const [dates, setDates] = useState(() => ({
    createdAt: task.createdAt ?? null,
    completedAt: task.completedAt ?? null,
    canceledAt: task.canceledAt ?? null,
  }));

  const parentId = task.parentId ?? null;
  const needsParentDates = !dates.createdAt && parentId != null;
  const { data: parentTopics } = useTopics(parentId, { enabled: needsParentDates });

  useEffect(() => {
    setDates({
      createdAt: task.createdAt ?? null,
      completedAt: task.completedAt ?? null,
      canceledAt: task.canceledAt ?? null,
    });
  }, [task.id, task.createdAt, task.completedAt, task.canceledAt]);

  useEffect(() => {
    if (!needsParentDates) return;
    const match = parentTopics?.items?.find((item) => item.id === task.id);
    if (!match || match.type !== 'task' || !match.createdAt) return;
    const taskMatch = match as TaskListItem;
    setDates({
      createdAt: taskMatch.createdAt,
      completedAt: taskMatch.completedAt,
      canceledAt: taskMatch.canceledAt,
    });
  }, [needsParentDates, parentTopics, task.id]);

  function reportError(err: unknown) {
    onError?.(err instanceof Error ? err.message : 'Something went wrong');
  }

  function publishTaskPatch(patch: Partial<SelectedTask>) {
    onTaskPatched?.(patch);
    if (patch.createdAt || patch.completedAt || patch.canceledAt) {
      setDates((prev) => ({
        createdAt: patch.createdAt ?? prev.createdAt,
        completedAt: patch.completedAt ?? prev.completedAt,
        canceledAt: patch.canceledAt ?? prev.canceledAt,
      }));
    }
  }

  async function handleRename(name: string) {
    if (parentId == null) return;

    setSaving(true);
    try {
      const updated = await patchTopicMutation.mutateAsync({
        topicId: task.id,
        body: { name },
        listParentId: parentId,
      });
      publishTaskPatch({ name: updated.name });
    } catch (err) {
      reportError(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleDescription(description: string) {
    if (parentId == null) return;

    setSaving(true);
    try {
      const updated = await patchTaskMutation.mutateAsync({
        topicId: task.id,
        parentId,
        body: { description },
      });
      publishTaskPatch({
        description: updated.description,
        status: updated.status,
        createdAt: updated.createdAt,
        completedAt: updated.completedAt,
        canceledAt: updated.canceledAt,
      });
    } catch (err) {
      reportError(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(status: string) {
    if (parentId == null) return;

    setSaving(true);
    try {
      const updated = await patchTaskMutation.mutateAsync({
        topicId: task.id,
        parentId,
        body: { status },
      });
      publishTaskPatch({
        description: updated.description,
        status: updated.status,
        createdAt: updated.createdAt,
        completedAt: updated.completedAt,
        canceledAt: updated.canceledAt,
      });
    } catch (err) {
      reportError(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleMove(newParentId: number | null) {
    if (parentId == null) return;

    const oldParentId = parentId;
    setSaving(true);
    try {
      await patchTopicMutation.mutateAsync({
        topicId: task.id,
        body: { moveParent: true, parentId: newParentId },
        oldParentId,
        newParentId,
      });
      onLeaveTask?.();
    } catch (err) {
      reportError(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    setSaving(true);
    try {
      await deleteTaskMutation.mutateAsync({
        topicId: task.id,
        parentId,
      });
      onLeaveTask?.();
    } catch (err) {
      reportError(err);
    } finally {
      setSaving(false);
    }
  }

  return {
    saving: saving || patchTopicMutation.isPending || patchTaskMutation.isPending || deleteTaskMutation.isPending,
    dates,
    handleRename,
    handleDescription,
    handleStatus,
    handleMove,
    handleConfirmDelete,
  };
}
