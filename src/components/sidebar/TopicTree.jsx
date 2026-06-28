import { useCallback, useEffect, useRef, useState } from 'react';
import { getTopics } from '../../api';
import { FolderIcon, TaskIcon } from './TreeIcons';

function pruneRemovedItems(items, removedId) {
  if (!items || removedId == null) return items;
  return items.filter((item) => item.id !== removedId);
}

function TreeNode({
  node,
  depth,
  selectedId,
  onSelect,
  onExpandToggle,
  expanded,
  children,
  loading,
  parentFolderId,
  refreshEvent,
}) {
  const isTask = node.type === 'task';
  const isSelected = selectedId === node.id;

  function handleOpen() {
    onSelect({
      ...node,
      parentId: node.parentId ?? parentFolderId ?? null,
    });
  }

  return (
    <div className="tree-node">
      <div
        className={`tree-row${isSelected ? ' selected' : ''}`}
        style={{ paddingLeft: `${0.35 + depth * 0.85}rem` }}
      >
        {!isTask ? (
          <button
            type="button"
            className="tree-twistie"
            aria-expanded={expanded}
            aria-label={expanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
            onClick={onExpandToggle}
          >
            <span className="tree-twistie-icon" aria-hidden="true">
              {loading ? '…' : expanded ? '▾' : '▸'}
            </span>
          </button>
        ) : (
          <span className="tree-twistie tree-twistie-spacer" aria-hidden="true" />
        )}

        <button
          type="button"
          className="tree-row-main"
          aria-current={isSelected ? 'page' : undefined}
          onClick={handleOpen}
        >
          <span className="tree-icon">
            {isTask ? <TaskIcon status={node.status} /> : <FolderIcon open={expanded} />}
          </span>
          <span className="tree-label">{node.name}</span>
        </button>
      </div>

      {!isTask && expanded && children && (
        <div className="tree-children">
          {children.map((child) => (
            <TreeBranch
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              refreshEvent={refreshEvent}
              parentFolderId={node.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeBranch({ node, depth, selectedId, onSelect, refreshEvent, parentFolderId = null }) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState(null);
  const [loading, setLoading] = useState(false);
  const fetchIdRef = useRef(0);

  const loadChildren = useCallback(async (requestId) => {
    setLoading(true);
    try {
      const data = await getTopics(node.id);
      if (requestId !== fetchIdRef.current) return;
      setChildren(data.items || []);
    } finally {
      if (requestId === fetchIdRef.current) setLoading(false);
    }
  }, [node.id]);

  useEffect(() => {
    if (!refreshEvent) return;

    fetchIdRef.current = refreshEvent.id;

    const removedId = refreshEvent.movedTopicId ?? refreshEvent.deletedTopicId;
    if (removedId != null) {
      setChildren((prev) => pruneRemovedItems(prev, removedId));
    }

    if (refreshEvent.parentIds?.includes(node.id)) {
      setExpanded(true);
      loadChildren(refreshEvent.id);
    }
  }, [refreshEvent?.id, refreshEvent?.movedTopicId, refreshEvent?.deletedTopicId, node.id, loadChildren]);

  async function handleExpandToggle() {
    if (expanded) {
      setExpanded(false);
      return;
    }

    if (children === null) {
      const requestId = Date.now();
      fetchIdRef.current = requestId;
      await loadChildren(requestId);
    }
    setExpanded(true);
  }

  return (
    <TreeNode
      node={node}
      depth={depth}
      selectedId={selectedId}
      onSelect={onSelect}
      onExpandToggle={handleExpandToggle}
      expanded={expanded}
      children={children}
      loading={loading}
      parentFolderId={parentFolderId}
      refreshEvent={refreshEvent}
    />
  );
}

export default function TopicTree({ selectedId, onSelect, refreshEvent }) {
  const [roots, setRoots] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchIdRef = useRef(0);
  const hasRootsRef = useRef(false);

  useEffect(() => {
    const requestId = refreshEvent?.id ?? Date.now();
    fetchIdRef.current = requestId;

    const removedId = refreshEvent?.movedTopicId ?? refreshEvent?.deletedTopicId;
    if (removedId != null) {
      setRoots((prev) => pruneRemovedItems(prev, removedId));
    }

    const needsRootReload =
      refreshEvent == null ||
      refreshEvent.parentIds?.some((id) => id == null) ||
      refreshEvent.movedTopicId != null;

    if (!needsRootReload) return;

    if (!hasRootsRef.current) setLoading(true);

    getTopics(null)
      .then((data) => {
        if (requestId !== fetchIdRef.current) return;
        setRoots(data.items || []);
        hasRootsRef.current = true;
      })
      .finally(() => {
        if (requestId === fetchIdRef.current) setLoading(false);
      });
  }, [refreshEvent?.id, refreshEvent?.movedTopicId, refreshEvent?.deletedTopicId]);

  if (loading && !hasRootsRef.current) return <p className="tree-muted">Loading…</p>;

  return (
    <div className="topic-tree">
      {roots.length === 0 ? (
        <p className="tree-muted">No folders yet</p>
      ) : (
        roots.map((node) => (
          <TreeBranch
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedId}
            onSelect={onSelect}
            refreshEvent={refreshEvent}
          />
        ))
      )}
    </div>
  );
}
