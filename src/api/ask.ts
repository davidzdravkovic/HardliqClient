import { request } from './client';
import type { AskResponse } from '../types/domain/ask';

export function postAsk(question: string) {
  return request<AskResponse>('/api/ask', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}
