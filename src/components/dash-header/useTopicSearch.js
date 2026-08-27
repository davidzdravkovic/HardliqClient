import { useInfiniteQuery } from '@tanstack/react-query';
import { searchTopics } from '../../api';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { queryKeys } from '../../query/keys';

const MIN_QUERY_LENGTH = 2;
const PAGE_SIZE = 20;

export default function useTopicSearch(query, { debounceMs = 300 } = {}) {
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
    queryFn: ({ pageParam }) => searchTopics(trimmed, pageParam, PAGE_SIZE),
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
