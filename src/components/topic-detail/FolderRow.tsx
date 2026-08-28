import type { FolderListItem } from '../../types/domain/topics';
import type { SelectionSource } from '../../types/ui/selected';
import ReorderButtons from './ReorderButtons';
import type { ContentsFocusProps, ContentsReorderProps } from './types';
import { FolderIcon } from '../sidebar/TreeIcons';

type FolderRowProps = ContentsReorderProps &
  ContentsFocusProps & {
    item: FolderListItem;
    expanded: boolean;
    loading: boolean;
    onToggleExpand: () => void;
    onOpen: (item: SelectionSource) => void;
  };

export default function FolderRow({
  item,
  expanded,
  loading,
  onToggleExpand,
  onOpen,
  showReorder = false,
  index = 0,
  total = 1,
  reorderingId = null,
  onReorder,
  isFocused = false,
  onFocusRow,
}: FolderRowProps) {
  return (
    <div
      className={`folder-contents-row folder-contents-row-folder${expanded ? ' is-expanded' : ''}${isFocused ? ' is-focused' : ''}`}
      onMouseEnter={() => onFocusRow?.(index)}
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
        className="folder-contents-expand"
        aria-expanded={expanded}
        aria-label={expanded ? `Collapse ${item.name}` : `Expand ${item.name}`}
        onClick={onToggleExpand}
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
      <button type="button" className="folder-contents-open" onClick={() => onOpen(item)}>
        Open
      </button>
    </div>
  );
}
