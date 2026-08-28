import type { TaskListItem } from '../../types/domain/topics';
import type { SelectionSource } from '../../types/ui/selected';
import { statusClass, statusLabel, taskProgressHint } from './helpers';
import ReorderButtons from './ReorderButtons';
import type { ContentsFocusProps, ContentsReorderProps } from './types';
import { TaskIcon } from '../sidebar/TreeIcons';

type TaskRowProps = ContentsReorderProps &
  ContentsFocusProps & {
    item: TaskListItem;
    onSelect?: (item: SelectionSource) => void;
  };

export default function TaskRow({
  item,
  onSelect,
  showReorder = false,
  index = 0,
  total = 1,
  reorderingId = null,
  onReorder,
  isFocused = false,
  rowRef,
  onFocusRow,
}: TaskRowProps) {
  const hint = taskProgressHint(item);

  return (
    <li ref={rowRef} onMouseEnter={() => onFocusRow?.(index)}>
      <div
        className={`folder-contents-row folder-contents-row-task${isFocused ? ' is-focused' : ''}`}
      >
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
          className="folder-contents-row-main"
          onClick={() => onSelect?.(item)}
        >
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
