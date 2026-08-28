import { request } from './client';
import type {
  DeleteSummaryResponse,
  PatchTopicBody,
  TopicListResponse,
  TopicResponse,
} from '../types/domain/topics';
import type { TaskStats } from '../types/domain/tasks';

export type GetTopicsOptions = {
  page?: number;
  pageSize?: number;
};

export function getTopics(parentId?: number | null, options?: GetTopicsOptions) {
  const params = new URLSearchParams();
  if (parentId != null) params.set('parentId', String(parentId));
  if (options?.page != null) params.set('page', String(options.page));
  if (options?.pageSize != null) params.set('pageSize', String(options.pageSize));
  const query = params.toString();
  return request<TopicListResponse>(`/topics${query ? `?${query}` : ''}`);
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
  return request<TopicResponse>('/topics', {
    method: 'POST',
    body: JSON.stringify({ name, parentId: parentId ?? null }),
  });
}

export function patchTopic(topicId: number, body: PatchTopicBody = {}) {
  const payload: Record<string, unknown> = {};
  if (body.name !== undefined) payload.name = body.name;
  if (body.moveParent) {
    payload.moveParent = true;
    payload.parentId = body.parentId ?? null;
  }
  if (body.move !== undefined) payload.move = body.move;
  return request<TopicResponse>(`/topics/${topicId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function getTopicDeleteSummary(topicId: number) {
  return request<DeleteSummaryResponse>(`/topics/${topicId}/delete-summary`);
}

export function deleteTopic(topicId: number) {
  return request<void>(`/topics/${topicId}`, {
    method: 'DELETE',
  });
}

export function emptyTopicChildren(topicId: number) {
  return request<void>(`/topics/${topicId}/children`, {
    method: 'DELETE',
  });
}
