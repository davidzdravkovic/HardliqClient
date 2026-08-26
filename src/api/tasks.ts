import { request } from './client';

export function createTask(parentId: number, name: string, description: string) {
  return request(`/topics/${parentId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export function patchTask(
  topicId: number,
  { description, status }: { description?: string; status?: string } = {},
) {
  const body: Record<string, unknown> = {};
  if (description !== undefined) body.description = description;
  if (status !== undefined) body.status = status;
  return request(`/topics/${topicId}/task`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteTask(topicId: number) {
  return request(`/topics/${topicId}/task`, {
    method: 'DELETE',
  });
}
