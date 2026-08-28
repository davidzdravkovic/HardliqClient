import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../query/keys';
import type {
  CreateTaskResponse,
} from '../../types/domain/tasks';
import type {
  FolderListItem,
  TaskListItem,
  TopicListItem,
  TopicListResponse,
  TopicResponse,
} from '../../types/domain/topics';

export function toFolderListItem(topic: TopicResponse): FolderListItem {
  return {
    id: topic.id,
    name: topic.name,
    type: 'topic',
    parentId: topic.parentId,
    sortOrder: topic.sortOrder,
  };
}

export function toTaskListItem(task: CreateTaskResponse): TaskListItem {
  return {
    id: task.id,
    name: task.name,
    type: 'task',
    parentId: task.parentId,
    sortOrder: task.sortOrder,
    parentName: null,
    description: task.description,
    status: task.status,
    createdAt: task.createdAt,
    completedAt: task.completedAt,
    canceledAt: task.canceledAt,
  };
}

export function upsertListItem(
  queryClient: QueryClient,
  parentId: number | null,
  item: TopicListItem,
) {
  queryClient.setQueryData<TopicListResponse>(queryKeys.topics.list(parentId), (old) => {
    if (!old?.items) return old;

    const index = old.items.findIndex((entry) => entry.id === item.id);
    const items =
      index >= 0
        ? old.items.map((entry, i) => (i === index ? item : entry))
        : [...old.items, item];

    return {
      ...old,
      items,
      childType: items[0]?.type ?? old.childType,
      totalCount: index >= 0 ? old.totalCount : old.totalCount + 1,
    };
  });
}

export function removeListItem(
  queryClient: QueryClient,
  parentId: number | null,
  topicId: number,
) {
  queryClient.setQueryData<TopicListResponse>(queryKeys.topics.list(parentId), (old) => {
    if (!old?.items) return old;

    const items = old.items.filter((entry) => entry.id !== topicId);
    return {
      ...old,
      items,
      childType: items[0]?.type ?? null,
      totalCount: Math.max(0, old.totalCount - 1),
    };
  });
}

export function patchListItemName(
  queryClient: QueryClient,
  parentId: number | null,
  topicId: number,
  name: string,
) {
  patchItemInCaches(queryClient, parentId, topicId, { name });
}

export function patchTaskInCaches(
  queryClient: QueryClient,
  folderId: number,
  topicId: number,
  patch: Partial<TaskListItem>,
) {
  patchItemInCaches(queryClient, folderId, topicId, patch);
}

function patchItemInCaches(
  queryClient: QueryClient,
  parentId: number | null,
  topicId: number,
  patch: Partial<TopicListItem>,
) {
  const update = (old: TopicListResponse | undefined) => {
    if (!old?.items) return old;
    return {
      ...old,
      items: old.items.map((entry) =>
        entry.id === topicId ? ({ ...entry, ...patch } as TopicListItem) : entry,
      ),
    };
  };

  queryClient.setQueryData<TopicListResponse>(queryKeys.topics.list(parentId), update);

  if (parentId != null) {
    queryClient.setQueriesData<TopicListResponse>(
      { queryKey: queryKeys.topics.contentsAll(parentId) },
      update,
    );
  }
}

export function moveListItem(
  queryClient: QueryClient,
  topicId: number,
  oldParentId: number | null,
  newParentId: number | null,
  patch: Partial<TopicListItem> = {},
) {
  let moved: TopicListItem | undefined;

  queryClient.setQueryData<TopicListResponse>(queryKeys.topics.list(oldParentId), (old) => {
    if (!old?.items) return old;
    moved = old.items.find((entry) => entry.id === topicId);
    const items = old.items.filter((entry) => entry.id !== topicId);
    return {
      ...old,
      items,
      childType: items[0]?.type ?? null,
      totalCount: Math.max(0, old.totalCount - 1),
    };
  });

  if (moved) {
    upsertListItem(queryClient, newParentId, {
      ...moved,
      ...patch,
      parentId: newParentId,
    } as TopicListItem);
  }

  if (oldParentId != null) {
    invalidateTopicContents(queryClient, oldParentId);
  }
  if (newParentId != null) {
    invalidateTopicContents(queryClient, newParentId);
  }
}

export function clearFolderContents(queryClient: QueryClient, folderId: number) {
  queryClient.setQueriesData<TopicListResponse>(
    { queryKey: queryKeys.topics.contentsAll(folderId) },
    (old) =>
      old
        ? {
            ...old,
            items: [],
            childType: null,
            totalCount: 0,
            hasMore: false,
          }
        : old,
  );

  queryClient.setQueryData<TopicListResponse>(queryKeys.topics.list(folderId), (old) =>
    old
      ? {
          ...old,
          items: [],
          childType: null,
          totalCount: 0,
          hasMore: false,
        }
      : old,
  );
}

export function invalidateTopicContents(queryClient: QueryClient, folderId: number) {
  queryClient.invalidateQueries({ queryKey: queryKeys.topics.contentsAll(folderId) });
}

export function invalidateStatsAndRecent(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.topics.recent });
}
