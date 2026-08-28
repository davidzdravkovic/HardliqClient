import { useQuery } from '@tanstack/react-query';
import { getTopics } from '../topics';
import { queryKeys } from '../../query/keys';

export const FOLDER_CONTENTS_PAGE_SIZE = 10;

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

type UseFolderContentsOptions = {
  pageSize?: number;
  enabled?: boolean;
};

export function useFolderContents(
  folderId: number,
  page: number,
  { pageSize = FOLDER_CONTENTS_PAGE_SIZE, enabled = true }: UseFolderContentsOptions = {},
) {
  return useQuery({
    queryKey: queryKeys.topics.contents(folderId, page),
    queryFn: () => getTopics(folderId, { page, pageSize }),
    enabled,
  });
}
