import { useState } from 'react';
import { useTopics } from '../../api/hooks/topics';
import { FolderIcon, TaskIcon } from './TreeIcons';

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
              parentFolderId={node.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeBranch({ node, depth, selectedId, onSelect, parentFolderId = null }) {
  const [expanded, setExpanded] = useState(false);
  const { data, isPending, isFetching } = useTopics(node.id, { enabled: expanded });
  const children = expanded ? (data?.items ?? null) : null;
  const loading = expanded && (isPending || isFetching) && !data;

  function handleExpandToggle() {
    setExpanded((prev) => !prev);
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
    />
  );
}

export default function TopicTree({ selectedId, onSelect }) {
  const { data, isPending } = useTopics(null);
  const roots = data?.items ?? [];

  if (isPending && !data) return <p className="tree-muted">Loading…</p>;

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
          />
        ))
      )}
    </div>
  );
}
