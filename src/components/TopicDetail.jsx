import { useEffect, useRef, useState } from 'react';
import { FolderIcon, TaskIcon } from './TreeIcons';

// PAGE-SIZE: wire pagination here later (currently loads all items).
const CONTENTS_PAGE_SIZE = null;

function statusLabel(status) {
  const normalized = (status || 'Pending').toLowerCase();
  if (normalized === 'completed') return 'Done';
  if (normalized === 'canceled') return 'Cancelled';
  return 'Pending';
}

function statusClass(status) {
  const normalized = (status || 'Pending').toLowerCase();
  if (normalized === 'completed') return 'folder-contents-status-completed';
  if (normalized === 'canceled') return 'folder-contents-status-canceled';
  return 'folder-contents-status-pending';
}

function taskProgressHint(item) {
  const normalized = (item.status || 'Pending').toLowerCase();

  if (normalized === 'completed' && item.completedAt) {
    return `Completed ${formatShortDate(item.completedAt)}`;
  }

  if (normalized === 'canceled' && item.canceledAt) {
    return `Cancelled ${formatShortDate(item.canceledAt)}`;
  }

  if (normalized === 'pending') {
    return item.createdAt ? `Waiting since ${formatShortDate(item.createdAt)}` : 'In progress';
  }

  return '';
}

function formatShortDate(value) {
  try {
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function buildContentsList(directChildren, folderTasks) {
  const directIds = new Set(directChildren.map((item) => item.id));
  const nestedTasks = folderTasks.filter((item) => !directIds.has(item.id));

  const folders = directChildren.filter((item) => item.type === 'topic');
  const directTasks = directChildren.filter((item) => item.type === 'task');

  return [...folders, ...directTasks, ...nestedTasks];
}

function summaryLabel(items, stats) {
  const folders = items.filter((item) => item.type === 'topic').length;
  const tasks = items.filter((item) => item.type === 'task').length;
  const parts = [];

  if (folders > 0) parts.push(`${folders} folder${folders === 1 ? '' : 's'}`);
  if (tasks > 0) parts.push(`${tasks} task${tasks === 1 ? '' : 's'}`);

  const countLine = parts.length > 0 ? parts.join(' · ') : 'Empty';

  const total = stats?.totalTasks ?? 0;
  const completed = stats?.completed ?? 0;
  const progressLine =
    total > 0 ? `${completed} of ${total} done` : null;

  return progressLine ? `${countLine} — ${progressLine}` : countLine;
}

function FolderRow({ item, onSelect }) {
  return (
    <li>
      <button type="button" className="folder-contents-row" onClick={() => onSelect?.(item)}>
        <span className="folder-contents-icon" aria-hidden="true">
          <FolderIcon />
        </span>
        <span className="folder-contents-body">
          <span className="folder-contents-name">{item.name}</span>
          <span className="folder-contents-meta">Folder</span>
        </span>
      </button>
    </li>
  );
}

function TaskRow({ item, onSelect, nested }) {
  const hint = taskProgressHint(item);

  return (
    <li>
      <button type="button" className="folder-contents-row folder-contents-row-task" onClick={() => onSelect?.(item)}>
        <span className="folder-contents-icon" aria-hidden="true">
          <TaskIcon status={item.status} />
        </span>
        <span className="folder-contents-body">
          <span className="folder-contents-name">{item.name}</span>
          {nested && item.parentName && (
            <span className="folder-contents-location">in {item.parentName}</span>
          )}
          {item.description && (
            <span className="folder-contents-desc">{item.description}</span>
          )}
          {hint && <span className="folder-contents-meta">{hint}</span>}
        </span>
        <span className={`folder-contents-status ${statusClass(item.status)}`}>
          {statusLabel(item.status)}
        </span>
      </button>
    </li>
  );
}

export default function TopicDetail({
  folderId,
  directChildren = [],
  folderTasks = [],
  stats = null,
  childrenLoading,
  onSelectChild,
  section = 'menu',
  open: openProp,
  onOpenChange,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const menuRef = useRef(null);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  useEffect(() => {
    if (!isControlled) setInternalOpen(false);
  }, [folderId, isControlled]);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
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

  const scrollPanelId = `folder-contents-scroll-${folderId}`;

  const directIds = new Set(directChildren.map((item) => item.id));
  const allItems = buildContentsList(directChildren, folderTasks);
  const visibleItems = CONTENTS_PAGE_SIZE ? allItems.slice(0, CONTENTS_PAGE_SIZE) : allItems;
  const summary = summaryLabel(allItems, stats);

  const toggle = (
    <button
      type="button"
      className={`folder-contents-toggle${open ? ' is-open' : ''}`}
      aria-expanded={open}
      aria-controls={scrollPanelId}
      onClick={() => setOpen((value) => !value)}
      disabled={childrenLoading}
    >
      <span className="folder-contents-toggle-main">
        <span className="folder-contents-toggle-label">
          Contents{allItems.length > 0 ? ` (${allItems.length})` : ''}
        </span>
        <span className="folder-contents-chevron" aria-hidden="true">{open ? '▾' : '▸'}</span>
      </span>
      <span className="folder-contents-summary">{childrenLoading ? 'Loading…' : summary}</span>
    </button>
  );

  const panel = open ? (
    <div id={scrollPanelId} className="folder-contents-panel">
      {childrenLoading ? (
        <p className="folder-contents-muted">Loading…</p>
      ) : allItems.length === 0 ? (
        <p className="folder-workspace-empty">Nothing in this folder yet.</p>
      ) : (
        <ul className="folder-contents-list">
          {visibleItems.map((item) => {
            const nested = item.type === 'task' && !directIds.has(item.id);

            if (item.type === 'topic') {
              return <FolderRow key={item.id} item={item} onSelect={onSelectChild} />;
            }

            return (
              <TaskRow
                key={item.id}
                item={item}
                onSelect={onSelectChild}
                nested={nested}
              />
            );
          })}
        </ul>
      )}
    </div>
  ) : null;

  if (section === 'toggle') return toggle;
  if (section === 'panel') return panel;

  if (section === 'menu') {
    return (
      <div className="folder-contents-menu" ref={menuRef}>
        {toggle}
        {panel}
      </div>
    );
  }

  return (
    <section className="folder-workspace-body topic-detail-minimal">
      <div className="folder-contents-drawer">
        {toggle}
        {panel}
      </div>
    </section>
  );
}
