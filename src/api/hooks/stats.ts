import { useQuery } from '@tanstack/react-query';
import { getTaskStats } from '../topics';
import { queryKeys } from '../../query/keys';

export function useTaskStats(topicId?: number | null, since?: string) {
  return useQuery({
    queryKey: queryKeys.stats.detail(topicId, since),
    queryFn: () => getTaskStats(topicId, since),
  });
}
