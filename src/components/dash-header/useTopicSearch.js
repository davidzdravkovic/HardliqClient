import { useCallback, useEffect, useState } from 'react';
import { searchTopics } from '../../api';
import useDebouncedValue from '../../hooks/useDebouncedValue';

const MIN_QUERY_LENGTH = 2;
const PAGE_SIZE = 20;

export default function useTopicSearch(query, { debounceMs = 300 } = {}) {
  const debouncedQuery = useDebouncedValue(query, debounceMs);
  const trimmed = debouncedQuery.trim();

  const [searchState, setSearchState] = useState({ query: '', page: 1 });
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearchState({ query: trimmed, page: 1 });
    setItems([]);
    setTotalCount(0);
    setHasMore(false);
    setError('');
  }, [trimmed]);

  useEffect(() => {
    const { query: activeQuery, page } = searchState;

    if (activeQuery.length < MIN_QUERY_LENGTH) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    searchTopics(activeQuery, page, PAGE_SIZE)
      .then((data) => {
        if (cancelled) return;
        setItems((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
        setTotalCount(data.totalCount);
        setHasMore(data.hasMore);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        if (page === 1) {
          setItems([]);
          setTotalCount(0);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchState]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setSearchState((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [loading, hasMore]);

  const isActive = trimmed.length >= MIN_QUERY_LENGTH;
  const isWaiting = query.trim() !== trimmed;

  return {
    items,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    isActive,
    isWaiting,
    minQueryLength: MIN_QUERY_LENGTH,
  };
}
