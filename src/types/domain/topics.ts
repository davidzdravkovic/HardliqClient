export type TopicChildType = 'topic' | 'task';

export interface FolderListItem {
  id: number;
  name: string;
  type: 'topic';
  parentId: number | null;
  sortOrder: number;
}

export interface TaskListItem {
  id: number;
  name: string;
  type: 'task';
  parentId: number | null;
  sortOrder: number;
  parentName: string | null;
  description: string | null;
  status: string | null;
  createdAt: string | null;
  completedAt: string | null;
  canceledAt: string | null;
}

export type TopicListItem = FolderListItem | TaskListItem;

export interface TopicListResponse {
  parentId: number | null;
  childType: TopicChildType | null;
  items: TopicListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
