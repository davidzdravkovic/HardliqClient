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
