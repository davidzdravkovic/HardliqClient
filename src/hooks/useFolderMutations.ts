import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getTopicDeleteSummary } from '../api/topics';
import { useCreateTaskMutation } from '../api/hooks/mutations/tasks';
import {
  useCreateTopicMutation,
  useDeleteTopicMutation,
  useEmptyTopicChildrenMutation,
  usePatchTopicMutation,
} from '../api/hooks/mutations/topics';
import { queryKeys } from '../query/keys';
import type { DeleteSummaryResponse } from '../types/domain/topics';
import { formatDeleteTopicMessage, formatEmptyFolderMessage } from '../utils/deleteMessages';

type DeleteConfirmState = {
  topicId: number;
  name: string;
  parentId: number | null;
  summaryLoading: boolean;
  summary: DeleteSummaryResponse | null;
};

type EmptyConfirmState = {
  topicId: number;
  name: string;
  summaryLoading: boolean;
  summary: DeleteSummaryResponse | null;
};

type ConfirmDialogState = {
  open: boolean;
  message: string;
  loading: boolean;
  confirmDisabled: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export type UseFolderMutationsOptions = {
  folderId: number;
  folderName: string;
  folderParentId?: number | null;
  onError?: (message: string) => void;
  onFolderRenamed?: (name: string) => void;
  onLeaveFolder?: () => void;
};

export function useFolderMutations({
  folderId,
  folderName,
  folderParentId = null,
  onError,
  onFolderRenamed,
  onLeaveFolder,
}: UseFolderMutationsOptions) {
  const queryClient = useQueryClient();
  const createTopicMutation = useCreateTopicMutation();
  const createTaskMutation = useCreateTaskMutation();
  const patchTopicMutation = usePatchTopicMutation();
  const deleteTopicMutation = useDeleteTopicMutation();
  const emptyTopicChildrenMutation = useEmptyTopicChildrenMutation();

  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);
  const [emptyConfirm, setEmptyConfirm] = useState<EmptyConfirmState | null>(null);
  const [folderRenaming, setFolderRenaming] = useState(false);
  const [folderMoving, setFolderMoving] = useState(false);

  useEffect(() => {
    setDeleteConfirm(null);
    setEmptyConfirm(null);
  }, [folderId]);

  function reportError(err: unknown) {
    onError?.(err instanceof Error ? err.message : 'Something went wrong');
  }

  async function handleCreateTopic(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    onError?.('');
    try {
      await createTopicMutation.mutateAsync({ name: trimmed, parentId: folderId });
    } catch (err) {
      reportError(err);
      throw err;
    }
  }

  async function handleCreateTask(name: string, description: string) {
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    if (!trimmedName || !trimmedDesc) return;

    onError?.('');
    try {
      await createTaskMutation.mutateAsync({
        name: trimmedName,
        description: trimmedDesc,
        parentId: folderId,
      });
    } catch (err) {
      reportError(err);
      throw err;
    }
  }

  async function handleRenameFolder(name: string) {
    onError?.('');
    setFolderRenaming(true);
    try {
      const updated = await patchTopicMutation.mutateAsync({
        topicId: folderId,
        body: { name },
        listParentId: folderParentId,
      });
      onFolderRenamed?.(updated.name);
    } catch (err) {
      reportError(err);
      throw err;
    } finally {
      setFolderRenaming(false);
    }
  }

  async function handleMoveFolder(parentId: number | null) {
    const oldParentId = folderParentId;
    onError?.('');
    setFolderMoving(true);
    try {
      await patchTopicMutation.mutateAsync({
        topicId: folderId,
        body: { moveParent: true, parentId },
        oldParentId,
        newParentId: parentId,
      });
      onLeaveFolder?.();
    } catch (err) {
      reportError(err);
      setFolderMoving(false);
      throw err;
    }
  }

  async function openTopicDeleteConfirm() {
    setDeleteConfirm({
      topicId: folderId,
      name: folderName,
      parentId: folderParentId,
      summaryLoading: true,
      summary: null,
    });
    onError?.('');

    try {
      const summary = await queryClient.fetchQuery({
        queryKey: queryKeys.topics.deleteSummary(folderId),
        queryFn: () => getTopicDeleteSummary(folderId),
      });
      setDeleteConfirm((prev) =>
        prev?.topicId === folderId ? { ...prev, summaryLoading: false, summary } : prev,
      );
    } catch (err) {
      reportError(err);
      setDeleteConfirm(null);
    }
  }

  async function handleConfirmTopicDelete() {
    if (!deleteConfirm) return;

    onError?.('');
    try {
      await deleteTopicMutation.mutateAsync({
        topicId: deleteConfirm.topicId,
        listParentId: deleteConfirm.parentId ?? null,
      });
      setDeleteConfirm(null);
      onLeaveFolder?.();
    } catch (err) {
      reportError(err);
    }
  }

  async function openEmptyFolderConfirm() {
    setEmptyConfirm({
      topicId: folderId,
      name: folderName,
      summaryLoading: true,
      summary: null,
    });
    onError?.('');

    try {
      const summary = await queryClient.fetchQuery({
        queryKey: queryKeys.topics.deleteSummary(folderId),
        queryFn: () => getTopicDeleteSummary(folderId),
      });
      setEmptyConfirm((prev) =>
        prev?.topicId === folderId ? { ...prev, summaryLoading: false, summary } : prev,
      );
    } catch (err) {
      reportError(err);
      setEmptyConfirm(null);
    }
  }

  async function handleConfirmEmptyFolder() {
    if (!emptyConfirm) return;

    onError?.('');
    try {
      await emptyTopicChildrenMutation.mutateAsync({ topicId: emptyConfirm.topicId });
      setEmptyConfirm(null);
    } catch (err) {
      reportError(err);
    }
  }

  const deleteDialogMessage = deleteConfirm?.summaryLoading
    ? 'Checking topic contents…'
    : deleteConfirm
      ? formatDeleteTopicMessage(deleteConfirm.name, deleteConfirm.summary)
      : '';

  const emptyDialogMessage = emptyConfirm?.summaryLoading
    ? 'Checking topic contents…'
    : emptyConfirm
      ? formatEmptyFolderMessage(emptyConfirm.name, emptyConfirm.summary)
      : '';

  const deleteDialog: ConfirmDialogState = {
    open: Boolean(deleteConfirm),
    message: deleteDialogMessage,
    loading: deleteTopicMutation.isPending,
    confirmDisabled: Boolean(deleteConfirm?.summaryLoading),
    onConfirm: handleConfirmTopicDelete,
    onCancel: () =>
      !deleteTopicMutation.isPending &&
      !deleteConfirm?.summaryLoading &&
      setDeleteConfirm(null),
  };

  const emptyDialog: ConfirmDialogState = {
    open: Boolean(emptyConfirm),
    message: emptyDialogMessage,
    loading: emptyTopicChildrenMutation.isPending,
    confirmDisabled: Boolean(emptyConfirm?.summaryLoading || emptyConfirm?.summary?.totalCount === 0),
    onConfirm: handleConfirmEmptyFolder,
    onCancel: () =>
      !emptyTopicChildrenMutation.isPending &&
      !emptyConfirm?.summaryLoading &&
      setEmptyConfirm(null),
  };

  return {
    renaming: folderRenaming,
    moving: folderMoving,
    deleting: deleteTopicMutation.isPending,
    emptying: emptyTopicChildrenMutation.isPending,
    handleCreateTopic,
    handleCreateTask,
    handleRenameFolder,
    handleMoveFolder,
    openTopicDeleteConfirm,
    openEmptyFolderConfirm,
    deleteDialog,
    emptyDialog,
  };
}
