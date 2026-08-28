import type { TopicChildType, TopicListItem } from '../../types/domain/topics';
import type { TaskStats } from '../../types/domain/tasks';
import type { SelectionSource } from '../../types/ui/selected';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getTopics, patchTopic } from '../../api';
import { FOLDER_CONTENTS_PAGE_SIZE, useFolderContents } from '../../api/hooks/topics';
import { useIsMobileSheet } from '../../hooks/useIsMobileSheet';
import { queryKeys } from '../../query/keys';
import PaginationFooter from '../PaginationFooter';
import ContentsItem from './ContentsItem';
import { summaryLabel } from './helpers';
import type { ReorderDirection } from './types';

export type TopicDetailProps = {
  folderId: number;
  stats: TaskStats | null;
  onSelectChild: (item: SelectionSource) => void;
  onContentsChanged: () => void;
  onError: (message: string) => void;
  onChildTypeChange: (childType: TopicChildType | null) => void;
  onListLoadingChange: (loading: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function TopicDetail({
  folderId,
  stats = null,
  onSelectChild,
  onContentsChanged,
  onError,
  onChildTypeChange,
  onListLoadingChange,
  open,
  onOpenChange,
}: TopicDetailProps) {
  
  const queryClient = useQueryClient();
  const [rootPage, setRootPage] = useState(1);
  const [rootItems, setRootItems] = useState<TopicListItem[]>([]);
  const [reorderingId, setReorderingId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isMobileSheet = useIsMobileSheet();

  const { data, isPending, isFetching, error } = useFolderContents(folderId, rootPage);

  const totalCount = data?.totalCount ?? rootItems.length;
  const hasMore = Boolean(data?.hasMore);
  const listLoading = isPending || (isFetching && rootPage === 1 && rootItems.length === 0);
  const loadingMore = isFetching && rootPage > 1;
  const scrollPanelId = `folder-contents-scroll-${folderId}`;
  const summary = summaryLabel(rootItems, totalCount, stats);


  useEffect(() => {
    if (!data) return;
    if (data.page !== rootPage) return;

    const firstPage = data.page === 1

    if(firstPage) onChildTypeChange(data.childType ?? null);


    const items = data.items ?? [];
    setRootItems((prev) => {
      if (firstPage) return items;

      const overlap = items.some((item) => prev.some((p) => p.id === item.id));
      if (overlap) {
        const start = (data.page - 1) * FOLDER_CONTENTS_PAGE_SIZE;
        return [...prev.slice(0, start), ...items];
      }

      return [...prev, ...items];
    });
  }, [data]);


  useEffect(() => {
    onListLoadingChange(listLoading);
  }, [listLoading, onListLoadingChange]);

  useEffect(() => {
    if (error instanceof Error) onError(error.message);
  }, [error, onError]);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menuRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onOpenChange(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open, onOpenChange]);

  const handleReorder = useCallback(
    async (item: TopicListItem, direction: ReorderDirection) => {
      setReorderingId(item.id);
      const pagesLoaded = rootPage;
      try {
        await patchTopic(item.id, { move: direction });
        await queryClient.invalidateQueries({ queryKey: queryKeys.topics.contentsAll(folderId) });

        const merged: TopicListItem[] = [];
        for (let page = 1; page <= pagesLoaded; page += 1) {
          const pageData = await queryClient.query({
            queryKey: queryKeys.topics.contents(folderId, page),
            queryFn: () => getTopics(folderId, { page, pageSize: FOLDER_CONTENTS_PAGE_SIZE }),
          });
          merged.push(...(pageData.items ?? []));
        }

        setRootItems(merged);
        setRootPage(pagesLoaded);
        onContentsChanged();
      } catch (err: unknown) {
        onError(err instanceof Error ? err.message : 'Failed to reorder');
      } finally {
        setReorderingId(null);
      }
    },
    [folderId, rootPage, queryClient, onContentsChanged, onError],
  );

  const toggle = (
    <button
      type="button"
      className={`folder-contents-toggle${open ? ' is-open' : ''}`}
      aria-expanded={open}
      aria-controls={scrollPanelId}
      onClick={() => onOpenChange(!open)}
      disabled={listLoading && rootItems.length === 0}
    >
      <span className="folder-contents-toggle-main">
        <span className="folder-contents-toggle-label">
          Contents{totalCount > 0 ? ` (${totalCount})` : ''}
        </span>
        <span className="folder-contents-chevron" aria-hidden="true">{open ? '▾' : '▸'}</span>
      </span>
      <span className="folder-contents-summary">
        {listLoading && rootItems.length === 0 ? 'Loading…' : summary}
      </span>
    </button>
  );

  const panel = open ? (
    <div
      id={scrollPanelId}
      ref={panelRef}
      className={`folder-contents-panel${isMobileSheet ? ' folder-mobile-sheet' : ''}`}
      role="region"
      aria-label="Topic contents"
    >
      {listLoading && rootItems.length === 0 ? (
        <p className="folder-contents-muted">Loading…</p>
      ) : rootItems.length === 0 ? (
        <p className="folder-workspace-empty">Nothing in this topic yet.</p>
      ) : (
        <>
          <ul className="folder-contents-list">
            {rootItems.map((item, index) => (
              <ContentsItem
                key={item.id}
                item={item}
                onSelectChild={onSelectChild}
                showReorder
                index={index}
                total={rootItems.length}
                reorderingId={reorderingId}
                onReorder={handleReorder}
              />
            ))}
          </ul>
          <PaginationFooter
            compact
            shown={rootItems.length}
            total={totalCount}
            pageSize={FOLDER_CONTENTS_PAGE_SIZE}
            loading={loadingMore}
            hasMore={hasMore}
            onLoadMore={() => setRootPage((page) => page + 1)}
          />
        </>
      )}
    </div>
  ) : null;

  return (
    <div className="folder-contents-menu" ref={menuRef}>
      {toggle}
      {isMobileSheet ? panel && createPortal(panel, document.body) : panel}
    </div>
  );
}
