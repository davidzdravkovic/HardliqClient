import type { TopicListItem } from '../../types/domain/topics';
import type { SelectionSource } from '../../types/ui/selected';

export type ReorderDirection = 'up' | 'down';

export type ContentsReorderProps = {
  showReorder?: boolean;
  index?: number;
  total?: number;
  reorderingId?: number | null;
  onReorder?: (item: TopicListItem, direction: ReorderDirection) => void;
};

export type ContentsFocusProps = {
  isFocused?: boolean;
  rowRef?: (el: HTMLLIElement | null) => void;
  onFocusRow?: (index: number) => void;
};

export type ContentsSelectProps = {
  onSelectChild?: (item: SelectionSource) => void;
};
