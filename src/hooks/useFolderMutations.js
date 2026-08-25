import { useEffect, useState } from 'react';
import {
  createTask,
  createTopic,
  deleteTopic,
  emptyTopicChildren,
  getTopicDeleteSummary,
  patchTopic,
} from '../api';
import { formatDeleteTopicMessage, formatEmptyFolderMessage } from '../utils/deleteMessages';

export function useFolderMutations({
  folderId,
  folderName,
  folderParentId = null,
  refresh,
  onError,
  onFolderRenamed,
  onLeaveFolder,
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [emptyConfirm, setEmptyConfirm] = useState(null);
  const [topicDeleting, setTopicDeleting] = useState(false);
  const [folderEmptying, setFolderEmptying] = useState(false);
  const [folderRenaming, setFolderRenaming] = useState(false);
  const [folderMoving, setFolderMoving] = useState(false);

  useEffect(() => {
    setDeleteConfirm(null);
    setEmptyConfirm(null);
  }, [folderId]);

  function reportError(err) {
    onError?.(err.message);
  }

  async function handleCreateTopic(name) {
    const trimmed = name.trim();
    if (!trimmed) return;

    onError?.('');
    try {
      await createTopic(trimmed, folderId);
      refresh(folderId);
    } catch (err) {
      reportError(err);
      throw err;
    }
  }

  async function handleCreateTask(name, description) {
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    if (!trimmedName || !trimmedDesc) return;

    onError?.('');
    try {
      await createTask(folderId, trimmedName, trimmedDesc);
      refresh(folderId);
    } catch (err) {
      reportError(err);
      throw err;
    }
  }

  async function handleRenameFolder(name) {
    onError?.('');
    setFolderRenaming(true);
    try {
      const updated = await patchTopic(folderId, { name });
      onFolderRenamed?.(updated.name);
      refresh(folderParentId);
    } catch (err) {
      reportError(err);
      throw err;
    } finally {
      setFolderRenaming(false);
    }
  }

  async function handleMoveFolder(parentId) {
    const oldParentId = folderParentId;
    onError?.('');
    setFolderMoving(true);
    try {
      await patchTopic(folderId, { moveParent: true, parentId });
      onLeaveFolder?.();
      refresh([oldParentId, parentId], { movedTopicId: folderId });
    } catch (err) {
      reportError(err);
      setFolderMoving(false);
      throw err;
    }
  }

  function handleContentsChanged() {
    refresh(folderId);
  }

  async function openTopicDeleteConfirm() {
    const pending = {
      topicId: folderId,
      name: folderName,
      parentId: folderParentId,
      summaryLoading: true,
      summary: null,
    };
    setDeleteConfirm(pending);
    onError?.('');

    try {
      const summary = await getTopicDeleteSummary(folderId);
      setDeleteConfirm((prev) =>
        prev?.topicId === folderId
          ? { ...prev, summaryLoading: false, summary }
          : prev
      );
    } catch (err) {
      reportError(err);
      setDeleteConfirm(null);
    }
  }

  async function handleConfirmTopicDelete() {
    if (!deleteConfirm) return;

    const refreshParentId = deleteConfirm.parentId ?? null;
    const deletedTopicId = deleteConfirm.topicId;

    onError?.('');
    setTopicDeleting(true);

    try {
      await deleteTopic(deleteConfirm.topicId);
      setDeleteConfirm(null);
      onLeaveFolder?.();
      refresh(refreshParentId, { deletedTopicId });
    } catch (err) {
      reportError(err);
      setTopicDeleting(false);
    }
  }

  async function openEmptyFolderConfirm() {
    const pending = {
      topicId: folderId,
      name: folderName,
      summaryLoading: true,
      summary: null,
    };
    setEmptyConfirm(pending);
    onError?.('');

    try {
      const summary = await getTopicDeleteSummary(folderId);
      setEmptyConfirm((prev) =>
        prev?.topicId === folderId
          ? { ...prev, summaryLoading: false, summary }
          : prev
      );
    } catch (err) {
      reportError(err);
      setEmptyConfirm(null);
    }
  }

  async function handleConfirmEmptyFolder() {
    if (!emptyConfirm) return;

    onError?.('');
    setFolderEmptying(true);

    try {
      await emptyTopicChildren(emptyConfirm.topicId);
      setEmptyConfirm(null);
      refresh(emptyConfirm.topicId);
    } catch (err) {
      reportError(err);
    } finally {
      setFolderEmptying(false);
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

  return {
    renaming: folderRenaming,
    moving: folderMoving,
    deleting: topicDeleting,
    emptying: folderEmptying,
    handleCreateTopic,
    handleCreateTask,
    handleRenameFolder,
    handleMoveFolder,
    handleContentsChanged,
    openTopicDeleteConfirm,
    openEmptyFolderConfirm,
    deleteDialog: {
      open: Boolean(deleteConfirm),
      message: deleteDialogMessage,
      loading: topicDeleting,
      confirmDisabled: Boolean(deleteConfirm?.summaryLoading),
      onConfirm: handleConfirmTopicDelete,
      onCancel: () => !topicDeleting && !deleteConfirm?.summaryLoading && setDeleteConfirm(null),
    },
    emptyDialog: {
      open: Boolean(emptyConfirm),
      message: emptyDialogMessage,
      loading: folderEmptying,
      confirmDisabled: Boolean(emptyConfirm?.summaryLoading || emptyConfirm?.summary?.totalCount === 0),
      onConfirm: handleConfirmEmptyFolder,
      onCancel: () => !folderEmptying && !emptyConfirm?.summaryLoading && setEmptyConfirm(null),
    },
  };
}
