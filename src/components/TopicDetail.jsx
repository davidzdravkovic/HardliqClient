import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getTopics, patchTopic } from '../api';
import { FolderIcon, TaskIcon } from './sidebar/TreeIcons';
import { useIsMobileSheet } from '../hooks/useIsMobileSheet';
import PaginationFooter from './PaginationFooter';

const CONTENTS_PAGE_SIZE = 10;

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

function buildRootContentsList(items) {
  const folders = items.filter((item) => item.type === 'topic');
  const tasks = items.filter((item) => item.type === 'task');
  return [...folders, ...tasks];
}

function summaryLabel(items, totalCount, stats) {
  const folders = items.filter((item) => item.type === 'topic').length;
  const tasks = items.filter((item) => item.type === 'task').length;
  const parts = [];

  if (folders > 0) parts.push(`${folders} topic${folders === 1 ? '' : 's'}`);
  if (tasks > 0) parts.push(`${tasks} task${tasks === 1 ? '' : 's'}`);

  const countLine = parts.length > 0 ? parts.join(' · ') : 'Empty';
  const shownTotal = totalCount ?? items.length;
  const countPrefix = shownTotal > items.length ? `${items.length} of ${shownTotal} shown · ` : '';

  const total = stats?.totalTasks ?? 0;
  const completed = stats?.completed ?? 0;
  const progressLine = total > 0 ? `${completed} of ${total} done` : null;

  const summaryCore = progressLine ? `${countLine} — ${progressLine}` : countLine;
  return `${countPrefix}${summaryCore}`.replace(/^ · /, '');
}

function ReorderButtons({ item, index, total, reorderingId, onReorder }) {
  const busy = reorderingId === item.id;

  return (
    <span className="folder-contents-reorder">
      <button
        type="button"
        className="folder-contents-reorder-btn"
        aria-label={`Move ${item.name} up`}
        disabled={busy || index === 0}
        onClick={() => onReorder(item, 'up')}
      >
        ↑
      </button>
      <button
        type="button"
        className="folder-contents-reorder-btn"
        aria-label={`Move ${item.name} down`}
        disabled={busy || index === total - 1}
        onClick={() => onReorder(item, 'down')}
      >
        ↓
      </button>
    </span>
  );
}

function TaskRow({
  item,
  onSelect,
  showReorder,
  index,
  total,
  reorderingId,
  onReorder,
  isFocused,
  rowRef,
  onFocusRow,
}) {
  const hint = taskProgressHint(item);

  return (
    <li ref={rowRef} onMouseEnter={() => onFocusRow?.(index)}>
      <div className={`folder-contents-row folder-contents-row-task${isFocused ? ' is-focused' : ''}`}>
        {showReorder && (
          <ReorderButtons
            item={item}
            index={index}
            total={total}
            reorderingId={reorderingId}
            onReorder={onReorder}
          />
        )}
        <button type="button" className="folder-contents-row-main" onClick={() => onSelect?.(item)}>
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
      </div>
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
  showReorder,
  index,
  total,
  reorderingId,
  onReorder,
  isFocused,
  rowRef,
  onFocusRow,
}) {
  return (
    <li className="folder-contents-folder" ref={rowRef} onMouseEnter={() => onFocusRow?.(index)}>
      <div className={`folder-contents-row folder-contents-row-folder${expanded ? ' is-expanded' : ''}${isFocused ? ' is-focused' : ''}`}>
        {showReorder && (
          <ReorderButtons
            item={item}
            index={index}
            total={total}
            reorderingId={reorderingId}
            onReorder={onReorder}
          />
        )}
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
          <span className="folder-contents-meta">Topic</span>
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
            <li className="folder-contents-muted folder-contents-nested-status">Empty topic</li>
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
  showReorder = false,
  index = 0,
  total = 1,
  reorderingId,
  onReorder,
  isFocused = false,
  rowRef,
  onFocusRow,
}) {
  if (item.type === 'task') {
    return (
      <TaskRow
        item={item}
        onSelect={onSelectChild}
        showReorder={showReorder}
        index={index}
        total={total}
        reorderingId={reorderingId}
        onReorder={onReorder}
        isFocused={isFocused}
        rowRef={rowRef}
        onFocusRow={onFocusRow}
      />
    );
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
      showReorder={showReorder}
      index={index}
      total={total}
      reorderingId={reorderingId}
      onReorder={onReorder}
      isFocused={isFocused}
      rowRef={rowRef}
      onFocusRow={onFocusRow}
    />
  );
}

export default function TopicDetail({
  folderId,
  stats = null,
  refreshKey,
  onSelectChild,
  onContentsChanged,
  onError,
  section = 'menu',
  open: openProp,
  onOpenChange,
  registerEscape,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [childrenCache, setChildrenCache] = useState({});
  const [loadingIds, setLoadingIds] = useState(() => new Set());
  const [rootItems, setRootItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [rootPage, setRootPage] = useState(1);
  const [reorderingId, setReorderingId] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const menuRef = useRef(null);
  const panelRef = useRef(null);
  const rowRefs = useRef([]);
  const isMobileSheet = useIsMobileSheet();
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  const loadRootPage = useCallback(async (page, { append = false } = {}) => {
    if (append) setLoadingMore(true);
    else setListLoading(true);

    try {
      const data = await getTopics(folderId, { page, pageSize: CONTENTS_PAGE_SIZE });
      const items = buildRootContentsList(data.items || []);
      let merged = items;
      setRootItems((prev) => {
        merged = append ? [...prev, ...items] : items;
        return merged;
      });
      setTotalCount(data.totalCount ?? items.length);
      setHasMore(Boolean(data.hasMore));
      setRootPage(page);
      return merged;
    } catch (err) {
      if (!append) {
        setRootItems([]);
        setTotalCount(0);
        setHasMore(false);
      }
      onError?.(err.message);
      return null;
    } finally {
      if (append) setLoadingMore(false);
      else setListLoading(false);
    }
  }, [folderId, onError]);

  useEffect(() => {
    if (!isControlled) setInternalOpen(false);
  }, [folderId, isControlled]);

  useEffect(() => {
    setExpandedIds(new Set());
    setChildrenCache({});
    setLoadingIds(new Set());
    setRootPage(1);
    loadRootPage(1);
  }, [folderId, refreshKey, loadRootPage]);

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

  async function reloadLoadedPages(fromPage) {
    let merged = await loadRootPage(1);
    for (let page = 2; page <= fromPage; page += 1) {
      merged = await loadRootPage(page, { append: true });
    }
    return merged;
  }

  const handleReorder = useCallback(async (item, direction) => {
    setReorderingId(item.id);
    const pagesLoaded = rootPage;
    try {
      await patchTopic(item.id, { move: direction });
      const merged = await reloadLoadedPages(pagesLoaded);
      onContentsChanged?.();
      if (merged) {
        const nextIndex = merged.findIndex((entry) => entry.id === item.id);
        if (nextIndex >= 0) setFocusedIndex(nextIndex);
      }
    } catch (err) {
      onError?.(err.message);
    } finally {
      setReorderingId(null);
    }
  }, [rootPage, loadRootPage, onContentsChanged, onError]);

  useEffect(() => {
    if (!open) {
      setFocusedIndex(0);
      return undefined;
    }

    panelRef.current?.focus({ preventScroll: true });
    return registerEscape?.(() => {
      setOpen(false);
      return true;
    });
  }, [open, registerEscape]);

  useEffect(() => {
    if (focusedIndex >= rootItems.length) {
      setFocusedIndex(Math.max(0, rootItems.length - 1));
    }
  }, [rootItems.length, focusedIndex]);

  useEffect(() => {
    rowRefs.current[focusedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex]);

  useEffect(() => {
    if (!open || rootItems.length === 0) return undefined;

    function handlePanelKeyDown(event) {
      if (!panelRef.current) return;
      const inPanel = panelRef.current.contains(document.activeElement)
        || document.activeElement === panelRef.current;
      if (!inPanel) return;

      const item = rootItems[focusedIndex];
      if (!item) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, rootItems.length - 1));
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      const reorderModifier = event.altKey || event.ctrlKey;
      if (reorderModifier && event.key === 'ArrowDown' && focusedIndex < rootItems.length - 1) {
        event.preventDefault();
        handleReorder(item, 'down');
        return;
      }

      if (reorderModifier && event.key === 'ArrowUp' && focusedIndex > 0) {
        event.preventDefault();
        handleReorder(item, 'up');
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        onSelectChild?.(item);
      }
    }

    document.addEventListener('keydown', handlePanelKeyDown, true);
    return () => document.removeEventListener('keydown', handlePanelKeyDown, true);
  }, [open, rootItems, focusedIndex, handleReorder, onSelectChild]);

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

  const scrollPanelId = `folder-contents-scroll-${folderId}`;
  const summary = summaryLabel(rootItems, totalCount, stats);

  const toggle = (
    <button
      type="button"
      className={`folder-contents-toggle${open ? ' is-open' : ''}`}
      aria-expanded={open}
      aria-controls={scrollPanelId}
      onClick={() => setOpen((value) => !value)}
      disabled={listLoading && rootItems.length === 0}
    >
      <span className="folder-contents-toggle-main">
        <span className="folder-contents-toggle-label">
          Contents{totalCount > 0 ? ` (${totalCount})` : ''}
        </span>
        <span className="folder-contents-chevron" aria-hidden="true">{open ? '▾' : '▸'}</span>
      </span>
      <span className="folder-contents-summary">{listLoading && rootItems.length === 0 ? 'Loading…' : summary}</span>
    </button>
  );

  const panel = open ? (
    <div
      id={scrollPanelId}
      ref={panelRef}
      className={`folder-contents-panel${isMobileSheet ? ' folder-mobile-sheet' : ''}`}
      role="region"
      aria-label="Topic contents"
      tabIndex={-1}
    >
      {listLoading && rootItems.length === 0 ? (
        <p className="folder-contents-muted">Loading…</p>
      ) : rootItems.length === 0 ? (
        <p className="folder-workspace-empty">Nothing in this topic yet.</p>
      ) : (
        <>
          <ul className="folder-contents-list">
            {rootItems.map((item, index) => (
              <ContentsItem
                key={item.id}
                item={item}
                onSelectChild={onSelectChild}
                expandedIds={expandedIds}
                childrenCache={childrenCache}
                loadingIds={loadingIds}
                onToggleExpand={handleToggleExpand}
                showReorder
                index={index}
                total={rootItems.length}
                reorderingId={reorderingId}
                onReorder={handleReorder}
                isFocused={focusedIndex === index}
                onFocusRow={setFocusedIndex}
                rowRef={(el) => {
                  rowRefs.current[index] = el;
                }}
              />
            ))}
          </ul>
          <PaginationFooter
            compact
            shown={rootItems.length}
            total={totalCount}
            pageSize={CONTENTS_PAGE_SIZE}
            loading={loadingMore}
            hasMore={hasMore}
            onLoadMore={() => loadRootPage(rootPage + 1, { append: true })}
          />
        </>
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
