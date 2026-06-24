import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useIsMobileSheet } from '../hooks/useIsMobileSheet';

function MenuDotsIcon() {
  return (
    <svg className="folder-options-icon" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <circle cx="10" cy="4.5" r="1.6" fill="currentColor" />
      <circle cx="10" cy="10" r="1.6" fill="currentColor" />
      <circle cx="10" cy="15.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

export default function FolderOptions({
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
  onDeleteClick,
  deleting,
  section = 'menu',
  open: openProp,
  onOpenChange,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [view, setView] = useState('menu');
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
  }, [folderId, folderName, isControlled]);

  useEffect(() => {
    if (!open) {
      setView('menu');
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

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
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

  function openAddTask() {
    setView('task');
    onAddModeChange?.('task');
  }

  const toggle = (
    <button
      type="button"
      className={`folder-options-toggle${open ? ' is-open' : ''}`}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-label={`Options for ${folderName}`}
      title="Folder options"
      onClick={() => setOpen((value) => !value)}
      disabled={childrenLoading}
    >
      <MenuDotsIcon />
    </button>
  );

  const menuList = (
    <ul className="folder-options-menu" role="menu" aria-label={`Actions for ${folderName}`}>
      {canAddFolder && (
        <li role="none">
          <button type="button" className="folder-options-menu-item" role="menuitem" onClick={openAddFolder}>
            Add folder
          </button>
        </li>
      )}
      {canAddTask && (
        <li role="none">
          <button type="button" className="folder-options-menu-item" role="menuitem" onClick={openAddTask}>
            Add task
          </button>
        </li>
      )}
      <li className="folder-options-menu-divider" role="separator" aria-hidden="true" />
      <li role="none">
        <button
          type="button"
          className="folder-options-menu-item folder-options-menu-item-danger"
          role="menuitem"
          onClick={onDeleteClick}
          disabled={deleting}
        >
          Delete folder
        </button>
      </li>
    </ul>
  );

  const topicForm = (
    <div className="folder-options-form">
      <p className="folder-options-form-title">New folder</p>
      <form className="add-form add-form-folder add-inline" onSubmit={onCreateTopic}>
        <div className="add-form-row">
          <input
            className="field"
            placeholder="Folder name"
            value={topicName}
            onChange={(e) => onTopicNameChange(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-folder btn-sm">Add</button>
        </div>
      </form>
    </div>
  );

  const taskForm = (
    <div className="folder-options-form">
      <p className="folder-options-form-title">New task</p>
      <form className="add-form add-form-task" onSubmit={onCreateTask}>
        <input
          className="field"
          placeholder="What needs doing?"
          value={taskName}
          onChange={(e) => onTaskNameChange(e.target.value)}
          autoFocus
        />
        <textarea
          className="field"
          placeholder="What's the task about?"
          rows={2}
          value={taskDesc}
          onChange={(e) => onTaskDescChange(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm add-task-submit">
          Add task
        </button>
      </form>
    </div>
  );

  const panel = open ? (
    <div
      ref={panelRef}
      className={`folder-options-panel${isMobileSheet ? ' folder-mobile-sheet' : ''}`}
    >
      {view === 'menu' && menuList}
      {view === 'topic' && topicForm}
      {view === 'task' && taskForm}
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
