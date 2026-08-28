import { request } from './client';
import type { CreateTaskResponse, TaskDetailResponse, PatchTaskBody } from '../types/domain/tasks';

export function createTask(parentId: number, name: string, description: string) {
  return request<CreateTaskResponse>(`/topics/${parentId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export function patchTask(topicId: number, body: PatchTaskBody = {}) {
  const payload: Record<string, unknown> = {};
  if (body.description !== undefined) payload.description = body.description;
  if (body.status !== undefined) payload.status = body.status;
  return request<TaskDetailResponse>(`/topics/${topicId}/task`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteTask(topicId: number) {
  return request<void>(`/topics/${topicId}/task`, {
    method: 'DELETE',
  });
}
