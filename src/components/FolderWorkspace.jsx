import { useEffect, useState } from 'react';
import WorkspaceStats from './WorkspaceStats';
import TopicDetail from './topic-detail';
import FolderOptions from './FolderOptions';
import ConfirmDialog from './ConfirmDialog';
import { useFolderMutations } from '../hooks/useFolderMutations';

/**
 * @param {{
 *   folderId: number,
 *   folderName: string,
 *   folderParentId?: number | null,
 *   refreshKey?: number,
 *   refresh: import('../types/ui/refreshEvent').RefreshFn,
 *   onSelectChild: (item: import('../types/ui/selected').SelectionSource | null) => void,
 *   onError: (message: string) => void,
 *   onFolderRenamed: (name: string) => void,
 *   onLeaveFolder: () => void,
 * }} props
 */
export default function FolderWorkspace({
  folderId,
  folderName,
  folderParentId = null,
  refreshKey,
  refresh,
  onSelectChild,
  onError,
  onFolderRenamed,
  onLeaveFolder,
}) {
  const [contentsOpen, setContentsOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [childType, setChildType] = useState(null);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [addMode, setAddMode] = useState(null);

  const {
    renaming,
    moving,
    deleting,
    emptying,
    handleCreateTopic,
    handleCreateTask,
    handleRenameFolder,
    handleMoveFolder,
    handleContentsChanged,
    openTopicDeleteConfirm,
    openEmptyFolderConfirm,
    deleteDialog,
    emptyDialog,
  } = useFolderMutations({
    folderId,
    folderName,
    folderParentId,
    refresh,
    onError,
    onFolderRenamed,
    onLeaveFolder,
  });

  useEffect(() => {
    setContentsOpen(false);
    setOptionsOpen(false);
    setChildType(null);
    setAddMode(null);
  }, [folderId]);

  useEffect(() => {
    const anyOpen = contentsOpen || optionsOpen;
    if (!anyOpen) return undefined;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [contentsOpen, optionsOpen]);

  function closeMenus() {
    setContentsOpen(false);
    setOptionsOpen(false);
  }

  function handleContentsOpen(value) {
    const next = typeof value === 'function' ? value(contentsOpen) : value;
    setContentsOpen(next);
    if (next) setOptionsOpen(false);
  }

  function handleOptionsOpen(value) {
    const next = typeof value === 'function' ? value(optionsOpen) : value;
    setOptionsOpen(next);
    if (next) setContentsOpen(false);
  }

  return (
    <>
      <WorkspaceStats
        topicId={folderId}
        displayName={folderName}
        headerMenu={
          <FolderOptions
            folderName={folderName}
            folderId={folderId}
            folderParentId={folderParentId}
            childType={childType}
            childrenLoading={childrenLoading}
            addMode={addMode}
            onAddModeChange={setAddMode}
            onCreateTopic={handleCreateTopic}
            onCreateTask={handleCreateTask}
            onRenameFolder={handleRenameFolder}
            renaming={renaming}
            onMoveFolder={handleMoveFolder}
            moving={moving}
            onDeleteClick={openTopicDeleteConfirm}
            deleting={deleting}
            onEmptyClick={openEmptyFolderConfirm}
            emptying={emptying}
            section="menu"
            open={optionsOpen}
            onOpenChange={handleOptionsOpen}
          />
        }
      >
        {(stats) => (
          <>
            {(contentsOpen || optionsOpen) && (
              <button
                type="button"
                className="folder-mobile-backdrop"
                aria-label="Close menu"
                onClick={closeMenus}
              />
            )}
            <div className="folder-workspace-controls">
              <TopicDetail
                folderId={folderId}
                stats={stats}
                onError={onError}
                open={contentsOpen}
                onOpenChange={handleContentsOpen}
                onSelectChild={onSelectChild}
                onContentsChanged={handleContentsChanged}
                onChildTypeChange={setChildType}
                onListLoadingChange={setChildrenLoading}
              />
            </div>
          </>
        )}
      </WorkspaceStats>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete topic"
        message={deleteDialog.message}
        confirmLabel="Delete topic"
        cancelLabel="Cancel"
        loading={deleteDialog.loading}
        confirmDisabled={deleteDialog.confirmDisabled}
        danger
        onConfirm={deleteDialog.onConfirm}
        onCancel={deleteDialog.onCancel}
      />

      <ConfirmDialog
        open={emptyDialog.open}
        title="Empty topic"
        message={emptyDialog.message}
        confirmLabel="Empty topic"
        cancelLabel="Cancel"
        loading={emptyDialog.loading}
        confirmDisabled={emptyDialog.confirmDisabled}
        danger
        onConfirm={emptyDialog.onConfirm}
        onCancel={emptyDialog.onCancel}
      />
    </>
  );
}
