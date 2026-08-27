import { useQuery } from '@tanstack/react-query';
import { getTopics } from '../topics';
import { queryKeys } from '../../query/keys';

type UseTopicsOptions = {
  enabled?: boolean;
};

export function useTopics(parentId?: number | null, { enabled = true }: UseTopicsOptions = {}) {
  return useQuery({
    queryKey: queryKeys.topics.list(parentId),
    queryFn: () => getTopics(parentId),
    enabled,
  });
}
