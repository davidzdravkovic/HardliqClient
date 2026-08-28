import { useState } from 'react';
import { useTopics } from '../../api/hooks/topics';
import type { FolderListItem } from '../../types/domain/topics';
import ContentsItem from './ContentsItem';
import FolderRow from './FolderRow';
import type { ContentsFocusProps, ContentsReorderProps, ContentsSelectProps } from './types';

type TopicBranchProps = ContentsReorderProps &
  ContentsFocusProps &
  ContentsSelectProps & {
    item: FolderListItem;
    depth?: number;
  };

export default function TopicBranch({
  item,
  depth = 0,
  onSelectChild,
  showReorder = false,
  index = 0,
  total = 1,
  reorderingId = null,
  onReorder,
  isFocused = false,
  rowRef,
  onFocusRow,
}: TopicBranchProps) {
  const [expanded, setExpanded] = useState(false);
  const { data, isPending, isFetching } = useTopics(item.id, { enabled: expanded });
  const children = expanded ? (data?.items ?? null) : null;
  const loading = expanded && (isPending || isFetching) && !data;

  return (
    <li className="folder-contents-folder" ref={rowRef}>
      <FolderRow
        item={item}
        expanded={expanded}
        loading={loading}
        onToggleExpand={() => setExpanded((prev) => !prev)}
        onOpen={onSelectChild ?? (() => undefined)}
        showReorder={showReorder}
        index={index}
        total={total}
        reorderingId={reorderingId}
        onReorder={onReorder}
        isFocused={isFocused}
        onFocusRow={onFocusRow}
      />

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
              />
            ))
          )}
        </ul>
      )}
    </li>
  );
}
