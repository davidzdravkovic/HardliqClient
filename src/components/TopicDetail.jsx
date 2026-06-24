import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getTopics } from '../api';
import { FolderIcon, TaskIcon } from './TreeIcons';
import { useIsMobileSheet } from '../hooks/useIsMobileSheet';

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

function buildRootContentsList(directChildren) {
  const folders = directChildren.filter((item) => item.type === 'topic');
  const tasks = directChildren.filter((item) => item.type === 'task');
  return [...folders, ...tasks];
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

function TaskRow({ item, onSelect }) {
  const hint = taskProgressHint(item);

  return (
    <li>
      <button type="button" className="folder-contents-row folder-contents-row-task" onClick={() => onSelect?.(item)}>
        <span className="folder-contents-icon" aria-hidden="true">
          <TaskIcon status={item.status} />
        </span>
        <span className="folder-contents-body">
          <span className="folder-contents-name">{item.name}</span>
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

function FolderRow({
  item,
  depth,
  expanded,
  loading,
  children,
  onToggleExpand,
  onOpen,
  onSelectChild,
  expandedIds,
  childrenCache,
  loadingIds,
}) {
  return (
    <li className="folder-contents-folder">
      <div className={`folder-contents-row folder-contents-row-folder${expanded ? ' is-expanded' : ''}`}>
        <button
          type="button"
          className="folder-contents-expand"
          aria-expanded={expanded}
          aria-label={expanded ? `Collapse ${item.name}` : `Expand ${item.name}`}
          onClick={() => onToggleExpand(item.id)}
          disabled={loading}
        >
          <span aria-hidden="true">{loading ? '…' : expanded ? '▾' : '▸'}</span>
        </button>
        <span className="folder-contents-icon" aria-hidden="true">
          <FolderIcon open={expanded} />
        </span>
        <span className="folder-contents-body">
          <span className="folder-contents-name">{item.name}</span>
          <span className="folder-contents-meta">Folder</span>
        </span>
        <button
          type="button"
          className="folder-contents-open"
          onClick={() => onOpen(item)}
        >
          Open
        </button>
      </div>

      {expanded && (
        <ul className="folder-contents-nested" data-depth={depth + 1}>
          {children === null ? (
            <li className="folder-contents-muted folder-contents-nested-status">Loading…</li>
          ) : children.length === 0 ? (
            <li className="folder-contents-muted folder-contents-nested-status">Empty folder</li>
          ) : (
            children.map((child) => (
              <ContentsItem
                key={child.id}
                item={child}
                depth={depth + 1}
                onSelectChild={onSelectChild}
                expandedIds={expandedIds}
                childrenCache={childrenCache}
                loadingIds={loadingIds}
                onToggleExpand={onToggleExpand}
              />
            ))
          )}
        </ul>
      )}
    </li>
  );
}

function ContentsItem({
  item,
  depth = 0,
  onSelectChild,
  expandedIds,
  childrenCache,
  loadingIds,
  onToggleExpand,
}) {
  if (item.type === 'task') {
    return <TaskRow item={item} onSelect={onSelectChild} />;
  }

  const expanded = expandedIds.has(item.id);
  const loading = loadingIds.has(item.id);
  const children = expanded ? (childrenCache[item.id] ?? null) : null;

  return (
    <FolderRow
      item={item}
      depth={depth}
      expanded={expanded}
      loading={loading}
      children={children}
      onToggleExpand={onToggleExpand}
      onOpen={onSelectChild}
      onSelectChild={onSelectChild}
      expandedIds={expandedIds}
      childrenCache={childrenCache}
      loadingIds={loadingIds}
    />
  );
}

export default function TopicDetail({
  folderId,
  directChildren = [],
  stats = null,
  childrenLoading,
  onSelectChild,
  section = 'menu',
  open: openProp,
  onOpenChange,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [childrenCache, setChildrenCache] = useState({});
  const [loadingIds, setLoadingIds] = useState(() => new Set());
  const menuRef = useRef(null);
  const panelRef = useRef(null);
  const isMobileSheet = useIsMobileSheet();
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  useEffect(() => {
    if (!isControlled) setInternalOpen(false);
  }, [folderId, isControlled]);

  useEffect(() => {
    setExpandedIds(new Set());
    setChildrenCache({});
    setLoadingIds(new Set());
  }, [folderId]);

  async function handleToggleExpand(id) {
    if (expandedIds.has(id)) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }

    if (childrenCache[id] === undefined) {
      setLoadingIds((prev) => new Set(prev).add(id));
      try {
        const data = await getTopics(id);
        setChildrenCache((prev) => ({ ...prev, [id]: data.items || [] }));
      } catch {
        setChildrenCache((prev) => ({ ...prev, [id]: [] }));
      } finally {
        setLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }

    setExpandedIds((prev) => new Set(prev).add(id));
  }

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

  const scrollPanelId = `folder-contents-scroll-${folderId}`;

  const rootItems = buildRootContentsList(directChildren);
  const visibleItems = CONTENTS_PAGE_SIZE ? rootItems.slice(0, CONTENTS_PAGE_SIZE) : rootItems;
  const summary = summaryLabel(rootItems, stats);

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
          Contents{rootItems.length > 0 ? ` (${rootItems.length})` : ''}
        </span>
        <span className="folder-contents-chevron" aria-hidden="true">{open ? '▾' : '▸'}</span>
      </span>
      <span className="folder-contents-summary">{childrenLoading ? 'Loading…' : summary}</span>
    </button>
  );

  const panel = open ? (
    <div
      id={scrollPanelId}
      ref={panelRef}
      className={`folder-contents-panel${isMobileSheet ? ' folder-mobile-sheet' : ''}`}
      role="region"
      aria-label="Folder contents"
    >
      {childrenLoading ? (
        <p className="folder-contents-muted">Loading…</p>
      ) : rootItems.length === 0 ? (
        <p className="folder-workspace-empty">Nothing in this folder yet.</p>
      ) : (
        <ul className="folder-contents-list">
          {visibleItems.map((item) => (
            <ContentsItem
              key={item.id}
              item={item}
              onSelectChild={onSelectChild}
              expandedIds={expandedIds}
              childrenCache={childrenCache}
              loadingIds={loadingIds}
              onToggleExpand={handleToggleExpand}
            />
          ))}
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
        {isMobileSheet
          ? panel && createPortal(panel, document.body)
          : panel}
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
