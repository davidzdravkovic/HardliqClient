import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  clearFolderContents,
  invalidateStatsAndRecent,
  invalidateTopicContents,
  moveListItem,
  patchListItemName,
  removeListItem,
  toFolderListItem,
  upsertListItem,
} from '../../cache/topicLists';
import {
  createTopic,
  deleteTopic,
  emptyTopicChildren,
  patchTopic,
} from '../../topics';
import { queryKeys } from '../../../query/keys';
import type { PatchTopicBody, TopicResponse } from '../../../types/domain/topics';

type CreateTopicVariables = {
  name: string;
  parentId: number | null;
};

export function useCreateTopicMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, parentId }: CreateTopicVariables) => createTopic(name, parentId),
    onSuccess: (data, { parentId }) => {
      upsertListItem(queryClient, parentId, toFolderListItem(data));
      if (parentId != null) {
        invalidateTopicContents(queryClient, parentId);
      }
      invalidateStatsAndRecent(queryClient);
    },
  });
}

type PatchTopicVariables = {
  topicId: number;
  body: PatchTopicBody;
  listParentId?: number | null;
  oldParentId?: number | null;
  newParentId?: number | null;
  folderId?: number;
};

export function usePatchTopicMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId, body }: PatchTopicVariables) => patchTopic(topicId, body),
    onSuccess: (data: TopicResponse, variables) => {
      const { body, listParentId, oldParentId, newParentId, folderId } = variables;

      if (body.name !== undefined && listParentId !== undefined) {
        patchListItemName(queryClient, listParentId, data.id, data.name);
      }

      if (body.moveParent) {
        moveListItem(queryClient, data.id, oldParentId ?? null, newParentId ?? null, {
          name: data.name,
          sortOrder: data.sortOrder,
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.topics.all });
      }

      if (body.move && folderId != null) {
        invalidateTopicContents(queryClient, folderId);
      }

      if (body.name !== undefined && listParentId != null) {
        invalidateTopicContents(queryClient, listParentId);
      }

      invalidateStatsAndRecent(queryClient);
    },
  });
}

type DeleteTopicVariables = {
  topicId: number;
  listParentId: number | null;
};

export function useDeleteTopicMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId }: DeleteTopicVariables) => deleteTopic(topicId),
    onSuccess: (_data, { topicId, listParentId }) => {
      removeListItem(queryClient, listParentId, topicId);
      if (listParentId != null) {
        invalidateTopicContents(queryClient, listParentId);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.topics.all });
      invalidateStatsAndRecent(queryClient);
    },
  });
}

type EmptyTopicChildrenVariables = {
  topicId: number;
};

export function useEmptyTopicChildrenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId }: EmptyTopicChildrenVariables) => emptyTopicChildren(topicId),
    onSuccess: (_data, { topicId }) => {
      clearFolderContents(queryClient, topicId);
      invalidateStatsAndRecent(queryClient);
    },
  });
}
