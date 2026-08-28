export interface TaskStats {
  scope: string;
  topicId: number | null;
  topicName: string | null;
  totalTasks: number;
  pending: number;
  completed: number;
  canceled: number;
  executedSince: string;
  completedSince: number;
  canceledSince: number;
}

export interface CreateTaskResponse {
  id: number;
  name: string;
  type: 'task';
  parentId: number | null;
  sortOrder: number;
  description: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  canceledAt: string | null;
}

export interface TaskDetailResponse {
  topicId: number;
  description: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  canceledAt: string | null;
}

export type PatchTaskBody = {
  description?: string;
  status?: string;
};
