import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useIsMobileSheet } from '../hooks/useIsMobileSheet';
import MoveTargetPicker from './MoveTargetPicker';

const TASK_UPDATE_STATUSES = ['Completed', 'Canceled'];

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
  if (type === 'description') {
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M3.5 4h9M5.5 8h5M7.5 12h1" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'status') {
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="m5.5 8 1.75 1.75L10.5 6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
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

export default function TaskOptions({
  taskId,
  taskName,
  taskDescription,
  taskStatus,
  canUpdateStatus,
  saving,
  onRename,
  onDescription,
  onStatus,
  onMove,
  onDeleteClick,
  open: openProp,
  onOpenChange,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [view, setView] = useState('menu');
  const [renameName, setRenameName] = useState(taskName);
  const [editDescription, setEditDescription] = useState(taskDescription);
  const [editStatus, setEditStatus] = useState('Completed');
  const menuRef = useRef(null);
  const panelRef = useRef(null);
  const isMobileSheet = useIsMobileSheet();
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  useEffect(() => {
    setRenameName(taskName);
    setEditDescription(taskDescription);
    setEditStatus(TASK_UPDATE_STATUSES.includes(taskStatus) ? taskStatus : 'Completed');
  }, [taskId, taskName, taskDescription, taskStatus]);

  useEffect(() => {
    if (!open) setView('menu');
  }, [open]);

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

  function openRename() {
    setRenameName(taskName);
    setView('rename');
  }

  function openDescription() {
    setEditDescription(taskDescription);
    setView('description');
  }

  function openStatus() {
    setEditStatus(TASK_UPDATE_STATUSES.includes(taskStatus) ? taskStatus : 'Completed');
    setView('status');
  }

  function openMove() {
    setView('move');
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    const trimmed = renameName.trim();
    if (!trimmed || trimmed === taskName) {
      setOpen(false);
      return;
    }
    try {
      await onRename?.(trimmed);
      setOpen(false);
    } catch {
      // parent shows error
    }
  }

  async function handleDescriptionSubmit(e) {
    e.preventDefault();
    if (!editDescription.trim()) return;
    try {
      await onDescription?.(editDescription.trim());
      setOpen(false);
    } catch {
      // parent shows error
    }
  }

  async function handleStatusSubmit(e) {
    e.preventDefault();
    try {
      await onStatus?.(editStatus);
      setOpen(false);
    } catch {
      // parent shows error
    }
  }

  async function handleMoveToFolder(folder) {
    try {
      await onMove?.(folder.id);
      setOpen(false);
    } catch {
      // parent shows error
    }
  }

  const toggle = (
    <button
      type="button"
      className={`folder-options-toggle${open ? ' is-open' : ''}`}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-label={`Options for ${taskName}`}
      title="Task options"
      onClick={() => setOpen((value) => !value)}
      disabled={saving}
    >
      <MenuDotsIcon />
    </button>
  );

  const menuList = (
    <div className="folder-options-menu" role="menu" aria-label={`Actions for ${taskName}`}>
      <PanelHeader title="Task options" />

      <div className="folder-options-section">
        <p className="folder-options-section-label">Edit</p>
        <div className="folder-options-chips">
          <button type="button" className="folder-options-chip folder-options-chip-task" role="menuitem" onClick={openDescription}>
            <MenuIcon type="description" />
            <span>Description</span>
          </button>
        </div>
      </div>

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
          {canUpdateStatus && (
            <button type="button" className="folder-options-tile" role="menuitem" onClick={openStatus}>
              <MenuIcon type="status" />
              <span>Status</span>
            </button>
          )}
        </div>
      </div>

      <div className="folder-options-section folder-options-section-danger">
        <button
          type="button"
          className="folder-options-danger-link"
          role="menuitem"
          onClick={onDeleteClick}
          disabled={saving}
        >
          Delete task
        </button>
      </div>
    </div>
  );

  const renameForm = (
    <div className="folder-options-form">
      <PanelHeader title="Rename task" onBack={() => setView('menu')} />
      <form className="add-form add-form-folder add-inline" onSubmit={handleRenameSubmit}>
        <div className="add-form-row">
          <input
            className="field"
            placeholder="Task name"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            disabled={saving}
            autoFocus
          />
          <button
            type="submit"
            className="btn btn-task btn-sm"
            disabled={saving || !renameName.trim() || renameName.trim() === taskName}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );

  const descriptionForm = (
    <div className="folder-options-form">
      <PanelHeader title="Edit description" onBack={() => setView('menu')} />
      <form className="add-form add-form-task" onSubmit={handleDescriptionSubmit}>
        <textarea
          className="field"
          placeholder="What's the task about?"
          rows={3}
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          disabled={saving}
          autoFocus
        />
        <button type="submit" className="btn btn-task btn-sm" disabled={saving || !editDescription.trim()}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );

  const statusForm = (
    <div className="folder-options-form">
      <PanelHeader title="Update status" onBack={() => setView('menu')} />
      <form className="add-form add-form-folder add-inline" onSubmit={handleStatusSubmit}>
        <div className="add-form-row">
          <select
            className="field"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            disabled={saving}
            autoFocus
          >
            {TASK_UPDATE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-task btn-sm" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );

  const moveForm = (
    <div className="folder-options-form folder-options-form-move">
      <PanelHeader title="Move task" onBack={() => setView('menu')} />
      <MoveTargetPicker
        excludeId={taskId}
        loading={saving}
        onSelectFolder={handleMoveToFolder}
        onCancel={() => setView('menu')}
        compact
      />
    </div>
  );

  const isFormView = view !== 'menu';
  const panel = open ? (
    <div
      ref={panelRef}
      className={`folder-options-panel${isFormView ? ' folder-options-panel-form' : ' folder-options-panel-menu'}${isMobileSheet ? ' folder-mobile-sheet' : ''}`}
    >
      {view === 'menu' && menuList}
      {view === 'rename' && renameForm}
      {view === 'description' && descriptionForm}
      {view === 'status' && statusForm}
      {view === 'move' && moveForm}
    </div>
  ) : null;

  return (
    <div className="folder-header-menu" ref={menuRef}>
      {toggle}
      {isMobileSheet ? panel && createPortal(panel, document.body) : panel}
    </div>
  );
}
