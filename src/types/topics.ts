export type TopicChildType = 'topic' | 'task';

export interface TopicListItem {
  id: number;
  name: string;
  type: TopicChildType;
  parentId: number | null;
  sortOrder: number;
  parentName: string | null;
  description: string | null;
  status: string | null;
  createdAt: string | null;
  completedAt: string | null;
  canceledAt: string | null;
}

export interface TopicListResponse {
  parentId: number | null;
  childType: TopicChildType | null;
  items: TopicListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
