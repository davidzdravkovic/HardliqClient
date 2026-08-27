import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { searchTopics } from '../topics';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { queryKeys } from '../../query/keys';
import type { TopicListItem } from '../../types/domain/topics';

const MIN_QUERY_LENGTH = 2;
const DEFAULT_PAGE_SIZE = 20;

type UseSearchTopicsOptions = {
  enabled?: boolean;
  debounceMs?: number;
  page?: number;
  pageSize?: number;
  excludeId?: number;
};

export function useSearchTopics(
  query: string,
  {
    enabled = true,
    debounceMs = 250,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    excludeId,
  }: UseSearchTopicsOptions = {},
) {
  const debouncedQuery = useDebouncedValue(query, debounceMs);
  const trimmed = debouncedQuery.trim();
  const isActive = enabled && trimmed.length >= MIN_QUERY_LENGTH;
  const isWaiting = query.trim() !== trimmed;

  const result = useQuery({
    queryKey: [...queryKeys.topics.search(trimmed), page, pageSize],
    queryFn: () => searchTopics(trimmed, page, pageSize),
    enabled: isActive,
  });

  const items = (result.data?.items ?? []).filter(
    (item): item is TopicListItem =>
      item.type === 'topic' && (excludeId == null || item.id !== excludeId),
  );

  return {
    items,
    searching: isActive && (result.isFetching || isWaiting),
    error: result.error instanceof Error ? result.error.message : '',
    isActive,
    isWaiting,
    minQueryLength: MIN_QUERY_LENGTH,
  };
}

type UseTopicSearchOptions = {
  debounceMs?: number;
};

export function useTopicSearch(query: string, { debounceMs = 300 }: UseTopicSearchOptions = {}) {
  const debouncedQuery = useDebouncedValue(query, debounceMs);
  const trimmed = debouncedQuery.trim();
  const isActive = trimmed.length >= MIN_QUERY_LENGTH;
  const isWaiting = query.trim() !== trimmed;

  const {
    data,
    error,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.topics.search(trimmed),
    queryFn: ({ pageParam }) => searchTopics(trimmed, pageParam, DEFAULT_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    enabled: isActive,
  });

  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages.at(-1)?.totalCount ?? 0;
  const loading = isActive && (isFetching || isWaiting) && !isFetchingNextPage;

  return {
    items,
    loading,
    error: error instanceof Error ? error.message : error ? String(error) : '',
    hasMore: Boolean(hasNextPage),
    totalCount,
    loadMore: () => {
      if (!isFetchingNextPage && hasNextPage) {
        fetchNextPage();
      }
    },
    isActive,
    isWaiting,
    minQueryLength: MIN_QUERY_LENGTH,
  };
}
