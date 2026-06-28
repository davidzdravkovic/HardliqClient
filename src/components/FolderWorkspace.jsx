import { useEffect, useState } from 'react';
import WorkspaceStats from './WorkspaceStats';
import TopicDetail from './TopicDetail';
import FolderOptions from './FolderOptions';

export default function FolderWorkspace({
  folderId,
  folderName,
  refreshKey,
  directChildren,
  folderTasks,
  folderStats,
  childrenLoading,
  childType,
  addMode,
  onAddModeChange,
  topicName,
  onTopicNameChange,
  onCreateTopic,
  taskName,
  onTaskNameChange,
  taskDesc,
  onTaskDescChange,
  onCreateTask,
  onRenameFolder,
  renaming,
  onSelectChild,
  onDeleteClick,
  deleting,
}) {
  const [contentsOpen, setContentsOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  useEffect(() => {
    setContentsOpen(false);
    setOptionsOpen(false);
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

  const topicProps = {
    folderId,
    directChildren,
    folderTasks,
    stats: folderStats,
    childrenLoading,
    onSelectChild,
  };

  const optionsProps = {
    folderName,
    folderId,
    childType,
    childrenLoading,
    addMode,
    onAddModeChange,
    topicName,
    onTopicNameChange,
    onCreateTopic,
    taskName,
    onTaskNameChange,
    taskDesc,
    onTaskDescChange,
    onCreateTask,
    onRenameFolder,
    renaming,
    onDeleteClick,
    deleting,
  };

  return (
    <WorkspaceStats
      topicId={folderId}
      displayName={folderName}
      refreshKey={refreshKey}
      headerMenu={
        <FolderOptions
          {...optionsProps}
          section="menu"
          open={optionsOpen}
          onOpenChange={handleOptionsOpen}
        />
      }
    >
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
          {...topicProps}
          section="menu"
          open={contentsOpen}
          onOpenChange={handleContentsOpen}
        />
      </div>
    </WorkspaceStats>
  );
}
