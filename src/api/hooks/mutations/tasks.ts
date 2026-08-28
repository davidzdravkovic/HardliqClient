import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  invalidateStatsAndRecent,
  invalidateTopicContents,
  patchTaskInCaches,
  removeListItem,
  toTaskListItem,
  upsertListItem,
} from '../../cache/topicLists';
import { createTask, deleteTask, patchTask } from '../../tasks';
import type { PatchTaskBody } from '../../../types/domain/tasks';

type CreateTaskVariables = {
  name: string;
  description: string;
  parentId: number;
};

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentId, name, description }: CreateTaskVariables) =>
      createTask(parentId, name, description),
    onSuccess: (data, { parentId }) => {
      upsertListItem(queryClient, parentId, toTaskListItem(data));
      invalidateTopicContents(queryClient, parentId);
      invalidateStatsAndRecent(queryClient);
    },
  });
}

type PatchTaskVariables = {
  topicId: number;
  parentId: number;
  body: PatchTaskBody;
};

export function usePatchTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId, body }: PatchTaskVariables) => patchTask(topicId, body),
    onSuccess: (data, { parentId, topicId }) => {
      patchTaskInCaches(queryClient, parentId, topicId, {
        description: data.description,
        status: data.status,
        createdAt: data.createdAt,
        completedAt: data.completedAt,
        canceledAt: data.canceledAt,
      });
      invalidateStatsAndRecent(queryClient);
    },
  });
}

type DeleteTaskVariables = {
  topicId: number;
  parentId: number | null;
};

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId }: DeleteTaskVariables) => deleteTask(topicId),
    onSuccess: (_data, { topicId, parentId }) => {
      if (parentId != null) {
        removeListItem(queryClient, parentId, topicId);
        invalidateTopicContents(queryClient, parentId);
      }
      invalidateStatsAndRecent(queryClient);
    },
  });
}
