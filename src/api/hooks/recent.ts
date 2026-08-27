import { useQuery } from '@tanstack/react-query';
import { getTaskStats, getTopics } from '../topics';
import { queryKeys } from '../../query/keys';
import type { FolderListItem } from '../../types/domain/topics';
import type { TaskStats } from '../../types/domain/tasks';

export type RecentTopic = FolderListItem & { stats: TaskStats | null };

async function fetchRecentTopics(): Promise<RecentTopic[]> {
  const data = await getTopics(null);
  const roots = (data.items ?? [])
    .filter((item): item is FolderListItem => item.type === 'topic')
    .slice(0, 4);

  return Promise.all(
    roots.map(async (topic) => {
      try {
        const stats = await getTaskStats(topic.id);
        return { ...topic, stats };
      } catch {
        return { ...topic, stats: null };
      }
    }),
  );
}

export function useRecentTopics() {
  return useQuery({
    queryKey: queryKeys.topics.recent,
    queryFn: fetchRecentTopics,
  });
}
