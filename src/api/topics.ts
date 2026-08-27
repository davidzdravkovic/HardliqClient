import { request } from './client';
import type { TopicListResponse } from '../types/domain/topics';
import type { TaskStats } from '../types/domain/tasks';

export function getTopics(parentId?: number | null) {
  const params = new URLSearchParams();
  if (parentId != null) params.set('parentId', String(parentId));
  const query = params.toString();
  return request<TopicListResponse>(`/topics${query ? `?${query}` : ''}`);
}

export function getFolderTasks(topicId: number) {
  return request(`/topics/${topicId}/tasks`);
}

export function getTaskStats(topicId?: number | null, since?: string) {
  const params = new URLSearchParams();
  if (topicId != null) params.set('topicId', String(topicId));
  if (since) params.set('since', since);
  const query = params.toString();
  return request<TaskStats>(`/topics/stats${query ? `?${query}` : ''}`);
}

export function searchTopics(q: string, page = 1, pageSize = 20) {
  const params = new URLSearchParams({
    q,
    page: String(page),
    pageSize: String(pageSize),
  });
  return request<TopicListResponse>(`/topics/search?${params}`);
}

export function createTopic(name: string, parentId?: number | null) {
  return request('/topics', {
    method: 'POST',
    body: JSON.stringify({ name, parentId: parentId ?? null }),
  });
}

export function patchTopic(
  topicId: number,
  {
    name,
    moveParent,
    parentId,
    move,
  }: {
    name?: string;
    moveParent?: boolean;
    parentId?: number | null;
    move?: 'up' | 'down';
  } = {},
) {
  const body: Record<string, unknown> = {};
  if (name !== undefined) body.name = name;
  if (moveParent) {
    body.moveParent = true;
    body.parentId = parentId ?? null;
  }
  if (move !== undefined) body.move = move;
  return request(`/topics/${topicId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function getTopicDeleteSummary(topicId: number) {
  return request(`/topics/${topicId}/delete-summary`);
}

export function deleteTopic(topicId: number) {
  return request(`/topics/${topicId}`, {
    method: 'DELETE',
  });
}

export function emptyTopicChildren(topicId: number) {
  return request(`/topics/${topicId}/children`, {
    method: 'DELETE',
  });
}
