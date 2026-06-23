import { useCallback, useEffect, useState } from 'react';
import { getTopics } from '../api';

function FolderIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M1.5 4.5h5l1.2 1.5H14.5v7.5H1.5V4.5z" fill="#a68b5b" />
        <path d="M1.5 3.5h5.3l1.2 1.5H14.5v1H6.5L5.3 4.5H1.5v-1z" fill="#c4a574" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1.5 4h5.5l1.2 1.5H14a.5.5 0 0 1 .5.5v6.5a.5.5 0 0 1-.5.5H1.5a.5.5 0 0 1-.5-.5V4.5a.5.5 0 0 1 .5-.5z" fill="#a68b5b" />
      <path d="M1.5 3h5.3l1.2 1.5H14v1H6.7L5.5 3H1.5V3z" fill="#c4a574" />
    </svg>
  );
}

function TaskIcon({ status }) {
  const normalized = (status || 'Pending').toLowerCase();

  if (normalized === 'completed') {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.5" stroke="#5f9b88" strokeWidth="1.5" />
        <path d="M5.5 8l1.8 1.8L10.5 6.5" stroke="#5f9b88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (normalized === 'canceled') {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.5" stroke="#e85d6c" strokeWidth="1.5" />
        <path d="M6 6l4 4M10 6l-4 4" stroke="#e85d6c" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="#f0b429" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2" fill="#f0b429" />
    </svg>
  );
}

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
    if (refreshEvent && refreshEvent.parentId === node.id) {
      setExpanded(true);
      loadChildren();
    }
  }, [refreshEvent, node.id, loadChildren]);

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
    if (!refreshEvent || refreshEvent.parentId !== null) return;
    getTopics(null).then((data) => setRoots(data.items || []));
  }, [refreshEvent]);

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
