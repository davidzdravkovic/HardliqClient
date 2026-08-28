import type { TopicListItem } from '../../types/domain/topics';
import TaskRow from './TaskRow';
import TopicBranch from './TopicBranch';
import type { ContentsFocusProps, ContentsReorderProps, ContentsSelectProps } from './types';

type ContentsItemProps = ContentsReorderProps &
  ContentsFocusProps &
  ContentsSelectProps & {
    item: TopicListItem;
    depth?: number;
  };

export default function ContentsItem({
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
}: ContentsItemProps) {
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

  return (
    <TopicBranch
      item={item}
      depth={depth}
      onSelectChild={onSelectChild}
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
