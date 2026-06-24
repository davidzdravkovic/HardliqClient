import { useCallback, useEffect, useState } from 'react';
import { getTopics } from '../api';
import { FolderIcon, TaskIcon } from './TreeIcons';

function TreeNode({ node, depth, selectedId, onSelect, onToggle, expanded, children, loading, refreshEvent }) {
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
            onSelect(node);
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
          {isTask ? <TaskIcon status={node.status} /> : <FolderIcon open={expanded} />}        </span>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeBranch({ node, depth, selectedId, onSelect, refreshEvent }) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadChildren = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTopics(node.id);
      setChildren(data.items || []);
    } finally {
      setLoading(false);
    }
  }, [node.id]);

  useEffect(() => {
    if (!refreshEvent) return;

    if (refreshEvent.parentId === node.id) {
      setExpanded(true);
      loadChildren();
    }
  }, [refreshEvent?.id, node.id, loadChildren]);

  async function handleToggle(n) {
    if (selectedId === n.id) {
      if (expanded) {
        setExpanded(false);
        return;
      }
      await loadChildren();
      setExpanded(true);
      return;
    }

    onSelect(n);
    if (!expanded) {
      await loadChildren();
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
    />
  );
}

export default function TopicTree({ selectedId, onSelect, refreshEvent, showAllTopics = true, searchQuery = '' }) {
  const [roots, setRoots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopics(null)
      .then((data) => setRoots(data.items || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!refreshEvent) return;

    if (refreshEvent.deletedTopicId != null) {
      setRoots((prev) => prev.filter((node) => node.id !== refreshEvent.deletedTopicId));
    }

    getTopics(null).then((data) => setRoots(data.items || []));
  }, [refreshEvent?.id]);

  if (loading) return <p className="tree-muted">Loading…</p>;

  const query = searchQuery.trim().toLowerCase();
  const visibleRoots = query
    ? roots.filter((node) => node.name.toLowerCase().includes(query))
    : roots;

  return (
    <div className="topic-tree">
      {showAllTopics && (
        <button
          type="button"
          className={`tree-all ${selectedId == null ? 'is-active' : ''}`}
          onClick={() => onSelect(null)}
        >
          <span className="tree-all-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path
                d="M2.5 7.2 8 3.2l5.5 4v5.3a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V7.2z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="tree-all-text">All topics</span>
        </button>
      )}

      {visibleRoots.length === 0 ? (
        <p className="tree-muted">{query ? 'No matches' : 'No topics yet'}</p>
      ) : (
        visibleRoots.map((node) => (
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
