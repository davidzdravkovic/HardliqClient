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
  onToggle,
  expanded,
  children,
  loading,
  refreshEvent,
  parentFolderId,
}) {
  const isTask = node.type === 'task';
  const isSelected = selectedId === node.id;

  return (
    <div className="tree-node">
      <button
        type="button"
        className={`tree-row ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${0.5 + depth * 0.85}rem` }}
        onClick={() => {
          if (isTask) {
            onSelect({
              ...node,
              parentId: node.parentId ?? parentFolderId ?? null,
            });
          } else {
            onToggle(node);
          }
        }}
      >
        {!isTask && (
          <span className="tree-chevron">{loading ? '…' : expanded ? '▾' : '▸'}</span>
        )}
        {isTask && <span className="tree-chevron tree-chevron-spacer" />}
        <span className="tree-icon">
          {isTask ? <TaskIcon status={node.status} /> : <FolderIcon open={expanded} />}
        </span>
        <span className="tree-label">{node.name}</span>
      </button>

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

  async function handleToggle(node) {
    if (selectedId === node.id) {
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
      return;
    }

    onSelect(node);
    if (!expanded) {
      if (children === null) {
        const requestId = Date.now();
        fetchIdRef.current = requestId;
        await loadChildren(requestId);
      }
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  }

  return (
    <TreeNode
      node={node}
      depth={depth}
      selectedId={selectedId}
      onSelect={onSelect}
      onToggle={handleToggle}
      expanded={expanded}
      children={children}
      loading={loading}
      refreshEvent={refreshEvent}
      parentFolderId={parentFolderId}
    />
  );
}

export default function TopicTree({ selectedId, onSelect, refreshEvent }) {
  const [roots, setRoots] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const requestId = Date.now();
    fetchIdRef.current = requestId;
    getTopics(null)
      .then((data) => {
        if (requestId !== fetchIdRef.current) return;
        setRoots(data.items || []);
      })
      .finally(() => {
        if (requestId === fetchIdRef.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!refreshEvent) return;

    const requestId = refreshEvent.id;
    fetchIdRef.current = requestId;

    const removedId = refreshEvent.movedTopicId ?? refreshEvent.deletedTopicId;
    if (removedId != null) {
      setRoots((prev) => pruneRemovedItems(prev, removedId));
    }

    getTopics(null).then((data) => {
      if (requestId !== fetchIdRef.current) return;
      setRoots(data.items || []);
    });
  }, [refreshEvent?.id, refreshEvent?.movedTopicId, refreshEvent?.deletedTopicId]);

  if (loading) return <p className="tree-muted">Loading…</p>;

  return (
    <div className="topic-tree">
      {roots.length === 0 ? (
        <p className="tree-muted">No topics yet</p>
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
