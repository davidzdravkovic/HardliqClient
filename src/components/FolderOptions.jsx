import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useIsMobileSheet } from '../hooks/useIsMobileSheet';
import MoveTargetPicker from './MoveTargetPicker';

function MenuDotsIcon() {
  return (
    <svg className="folder-options-icon" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <circle cx="10" cy="4.5" r="1.6" fill="currentColor" />
      <circle cx="10" cy="10" r="1.6" fill="currentColor" />
      <circle cx="10" cy="15.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

function MenuIcon({ type }) {
  if (type === 'folder') {
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h3l1 1.2H12.5A1.5 1.5 0 0 1 14 5.7v6.8A1.5 1.5 0 0 1 12.5 14h-9A1.5 1.5 0 0 1 2 12.5v-8Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  if (type === 'task') {
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <rect x="2.5" y="2.5" width="11" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="m5 8 2 2 4-4.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'rename') {
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M10.5 2.5 13.5 5.5 5 14H2v-3L10.5 2.5Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'move') {
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M8 2.5v11M4.5 6 8 2.5 11.5 6M4.5 10 8 13.5 11.5 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'empty') {
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M3 5.5h10M5.5 5.5V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M6 8v3.5M10 8v3.5M4.5 5.5 5 13h6l.5-7.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'delete') {
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M3.5 4.5h9M6 4.5V3.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M6.5 7v4.5M9.5 7v4.5M5 4.5l.5 8a1 1 0 0 0 1 .9h3a1 1 0 0 0 1-.9l.5-8" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3.5 4h9M5.5 8h5M7.5 12h1" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function PanelHeader({ title, onBack }) {
  return (
    <div className="folder-options-panel-head">
      {onBack ? (
        <button type="button" className="folder-options-back" onClick={onBack} aria-label="Back">
          ←
        </button>
      ) : (
        <span className="folder-options-back-spacer" aria-hidden="true" />
      )}
      <p className="folder-options-panel-title">{title}</p>
    </div>
  );
}

export default function FolderOptions({
  folderName,
  folderId,
  childType,
  childrenLoading,
  addMode,
  onAddModeChange,
  onCreateTopic,
  onCreateTask,
  onRenameFolder,
  renaming,
  onMoveFolder,
  moving,
  folderParentId = null,
  onDeleteClick,
  deleting,
  onEmptyClick,
  emptying,
  section = 'menu',
  open: openProp,
  onOpenChange,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [view, setView] = useState('menu');
  const [topicName, setTopicName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [renameName, setRenameName] = useState(folderName);
  const menuRef = useRef(null);
  const panelRef = useRef(null);
  const isMobileSheet = useIsMobileSheet();
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  useEffect(() => {
    if (!isControlled) {
      setInternalOpen(false);
      setView('menu');
    }
    setRenameName(folderName);
    setTopicName('');
    setTaskName('');
    setTaskDesc('');
  }, [folderId, folderName, isControlled]);

  useEffect(() => {
    if (!open) {
      setView('menu');
      setTopicName('');
      setTaskName('');
      setTaskDesc('');
      onAddModeChange?.(null);
    }
  }, [open, onAddModeChange]);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      const target = event.target;
      if (menuRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open]);

  function setOpen(value) {
    const next = typeof value === 'function' ? value(open) : value;
    if (isControlled) onOpenChange?.(next);
    else setInternalOpen(next);
  }

  const canAddFolder = childType === null || childType === 'topic';
  const canAddTask = childType === null || childType === 'task';

  function openAddFolder() {
    setView('topic');
    onAddModeChange?.('topic');
  }

  async function handleCreateTopicSubmit(e) {
    e.preventDefault();
    if (!topicName.trim()) return;

    try {
      await onCreateTopic(topicName.trim());
      setTopicName('');
    } catch {
      // Dashboard shows the error banner.
    }
  }

  async function handleCreateTaskSubmit(e) {
    e.preventDefault();
    if (!taskName.trim() || !taskDesc.trim()) return;

    try {
      await onCreateTask(taskName.trim(), taskDesc.trim());
      setTaskName('');
      setTaskDesc('');
    } catch {
      // Dashboard shows the error banner.
    }
  }

  function openAddTask() {
    setView('task');
    onAddModeChange?.('task');
  }

  function openRename() {
    setRenameName(folderName);
    setView('rename');
  }

  function openMove() {
    setView('move');
  }

  function openMoveToRootConfirm() {
    setView('move-root');
  }

  async function handleMoveToFolder(folder) {
    try {
      await onMoveFolder?.(folder.id);
      setOpen(false);
    } catch {
      // error shown by parent
    }
  }

  async function handleMoveToRoot() {
    try {
      await onMoveFolder?.(null);
      setOpen(false);
    } catch {
      // error shown by parent
    }
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    const trimmed = renameName.trim();
    if (!trimmed || trimmed === folderName) {
      setOpen(false);
      return;
    }
    try {
      await onRenameFolder?.(trimmed);
      setOpen(false);
    } catch {
      // error shown by parent
    }
  }

  const toggle = (
    <button
      type="button"
      className={`folder-options-toggle${open ? ' is-open' : ''}`}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-label={`Options for ${folderName}`}
      title="Topic options"
      onClick={() => setOpen((value) => !value)}
      disabled={childrenLoading}
    >
      <MenuDotsIcon />
    </button>
  );

  const menuList = (
    <div className="folder-options-menu" role="menu" aria-label={`Actions for ${folderName}`}>
      <PanelHeader title="Topic options" />

      {(canAddFolder || canAddTask) && (
        <div className="folder-options-section">
          <p className="folder-options-section-label">Create</p>
          <div className="folder-options-chips">
            {canAddFolder && (
              <button type="button" className="folder-options-chip folder-options-chip-folder" role="menuitem" onClick={openAddFolder}>
                <MenuIcon type="folder" />
                <span>Topic</span>
              </button>
            )}
            {canAddTask && (
              <button type="button" className="folder-options-chip folder-options-chip-task" role="menuitem" onClick={openAddTask}>
                <MenuIcon type="task" />
                <span>Task</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="folder-options-section">
        <p className="folder-options-section-label">Organize</p>
        <div className="folder-options-grid">
          <button type="button" className="folder-options-tile" role="menuitem" onClick={openRename}>
            <MenuIcon type="rename" />
            <span>Rename</span>
          </button>
          <button type="button" className="folder-options-tile" role="menuitem" onClick={openMove}>
            <MenuIcon type="move" />
            <span>Move</span>
          </button>
        </div>
      </div>

      <div className="folder-options-section folder-options-section-danger">
        <p className="folder-options-section-label">Remove</p>
        <div className="folder-options-grid folder-options-grid-danger">
          <button
            type="button"
            className="folder-options-tile folder-options-tile-danger"
            role="menuitem"
            onClick={onEmptyClick}
            disabled={deleting || emptying}
          >
            <MenuIcon type="empty" />
            <span>Empty</span>
            <span className="folder-options-tile-hint">Keep topic</span>
          </button>
          <button
            type="button"
            className="folder-options-tile folder-options-tile-danger folder-options-tile-danger-strong"
            role="menuitem"
            onClick={onDeleteClick}
            disabled={deleting || emptying}
          >
            <MenuIcon type="delete" />
            <span>Delete</span>
            <span className="folder-options-tile-hint">Remove all</span>
          </button>
        </div>
      </div>
    </div>
  );

  const topicForm = (
    <div className="folder-options-form">
      <PanelHeader title="New topic" onBack={() => setView('menu')} />
      <form className="add-form add-form-folder add-inline" onSubmit={handleCreateTopicSubmit}>
        <div className="add-form-row">
          <input
            className="field"
            placeholder="Topic name"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-folder btn-sm">Add</button>
        </div>
      </form>
    </div>
  );

  const taskForm = (
    <div className="folder-options-form">
      <PanelHeader title="New task" onBack={() => setView('menu')} />
      <form className="add-form add-form-task" onSubmit={handleCreateTaskSubmit}>
        <input
          className="field"
          placeholder="What needs doing?"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          autoFocus
        />
        <textarea
          className="field"
          placeholder="What's the task about?"
          rows={2}
          value={taskDesc}
          onChange={(e) => setTaskDesc(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm add-task-submit">
          Add task
        </button>
      </form>
    </div>
  );

  const renameForm = (
    <div className="folder-options-form">
      <PanelHeader title="Rename topic" onBack={() => setView('menu')} />
      <form className="add-form add-form-folder add-inline" onSubmit={handleRenameSubmit}>
        <div className="add-form-row">
          <input
            className="field"
            placeholder="Topic name"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            disabled={renaming}
            autoFocus
          />
          <button
            type="submit"
            className="btn btn-folder btn-sm"
            disabled={renaming || !renameName.trim() || renameName.trim() === folderName}
          >
            {renaming ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );

  const moveForm = (
    <div className="folder-options-form folder-options-form-move">
      <PanelHeader title="Move topic" onBack={() => setView('menu')} />
      <MoveTargetPicker
        excludeId={folderId}
        loading={moving}
        onSelectFolder={handleMoveToFolder}
        onMoveToRoot={folderParentId != null ? openMoveToRootConfirm : undefined}
        moveToRootLabel="Make root folder"
        onCancel={() => setView('menu')}
        compact
      />
    </div>
  );

  const moveRootConfirmForm = (
    <div className="folder-options-form folder-options-form-move-root">
      <PanelHeader title="Make root folder" onBack={() => setView('move')} />
      <p className="folder-options-move-root-message">
        Make <strong>{folderName}</strong> a root folder? It will appear in the main Folders list
        instead of inside its current topic.
      </p>
      <div className="folder-options-move-root-actions">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setView('move')}
          disabled={moving}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleMoveToRoot}
          disabled={moving}
        >
          {moving ? 'Moving…' : 'Make root folder'}
        </button>
      </div>
    </div>
  );

  const isFormView = view !== 'menu';
  const panel = open ? (
    <div
      ref={panelRef}
      className={`folder-options-panel${isFormView ? ' folder-options-panel-form' : ' folder-options-panel-menu'}${isMobileSheet ? ' folder-mobile-sheet' : ''}`}
    >
      {view === 'menu' && menuList}
      {view === 'topic' && topicForm}
      {view === 'task' && taskForm}
      {view === 'rename' && renameForm}
      {view === 'move' && moveForm}
      {view === 'move-root' && moveRootConfirmForm}
    </div>
  ) : null;

  if (section === 'toggle') {
    return <div className="folder-options-anchor">{toggle}</div>;
  }
  if (section === 'panel') {
    return panel ? <div className="folder-options-dropdown">{panel}</div> : null;
  }
  if (section === 'menu') {
    return (
      <div className="folder-header-menu" ref={menuRef}>
        {toggle}
        {isMobileSheet
          ? panel && createPortal(panel, document.body)
          : panel}
      </div>
    );
  }

  return (
    <div className="folder-options">
      {toggle}
      {panel}
    </div>
  );
}
