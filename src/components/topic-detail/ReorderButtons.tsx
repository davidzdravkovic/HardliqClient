import type { TopicListItem } from '../../types/domain/topics';
import type { ContentsReorderProps, ReorderDirection } from './types';

type ReorderButtonsProps = ContentsReorderProps & {
  item: TopicListItem;
};

export default function ReorderButtons({
  item,
  index = 0,
  total = 1,
  reorderingId = null,
  onReorder,
}: ReorderButtonsProps) {
  const busy = reorderingId === item.id;

  function handleClick(direction: ReorderDirection) {
    onReorder?.(item, direction);
  }

  return (
    <span className="folder-contents-reorder">
      <button
        type="button"
        className="folder-contents-reorder-btn"
        aria-label={`Move ${item.name} up`}
        disabled={busy || index === 0}
        onClick={() => handleClick('up')}
      >
        ↑
      </button>
      <button
        type="button"
        className="folder-contents-reorder-btn"
        aria-label={`Move ${item.name} down`}
        disabled={busy || index === total - 1}
        onClick={() => handleClick('down')}
      >
        ↓
      </button>
    </span>
  );
}
