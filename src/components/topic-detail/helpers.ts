import type { TaskListItem, TopicListItem } from '../../types/domain/topics';
import type { TaskStats } from '../../types/domain/tasks';

export function statusLabel(status: string | null | undefined): string {
  const normalized = (status || 'Pending').toLowerCase();
  if (normalized === 'completed') return 'Done';
  if (normalized === 'canceled') return 'Cancelled';
  return 'Pending';
}

export function statusClass(status: string | null | undefined): string {
  const normalized = (status || 'Pending').toLowerCase();
  if (normalized === 'completed') return 'folder-contents-status-completed';
  if (normalized === 'canceled') return 'folder-contents-status-canceled';
  return 'folder-contents-status-pending';
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export function taskProgressHint(item: TaskListItem): string {
  const normalized = (item.status || 'Pending').toLowerCase();

  if (normalized === 'completed' && item.completedAt) {
    return `Completed ${formatShortDate(item.completedAt)}`;
  }

  if (normalized === 'canceled' && item.canceledAt) {
    return `Cancelled ${formatShortDate(item.canceledAt)}`;
  }

  if (normalized === 'pending') {
    return item.createdAt ? `Waiting since ${formatShortDate(item.createdAt)}` : 'In progress';
  }

  return '';
}

export function summaryLabel(
  items: TopicListItem[],
  totalCount: number | null | undefined,
  stats: TaskStats | null | undefined,
): string {
  const folders = items.filter((item) => item.type === 'topic').length;
  const tasks = items.filter((item) => item.type === 'task').length;
  const parts: string[] = [];

  if (folders > 0) parts.push(`${folders} topic${folders === 1 ? '' : 's'}`);
  if (tasks > 0) parts.push(`${tasks} task${tasks === 1 ? '' : 's'}`);

  const countLine = parts.length > 0 ? parts.join(' · ') : 'Empty';
  const shownTotal = totalCount ?? items.length;
  const countPrefix =
    shownTotal > items.length ? `${items.length} of ${shownTotal} shown · ` : '';

  const total = stats?.totalTasks ?? 0;
  const completed = stats?.completed ?? 0;
  const progressLine = total > 0 ? `${completed} of ${total} done` : null;

  const summaryCore = progressLine ? `${countLine} — ${progressLine}` : countLine;
  return `${countPrefix}${summaryCore}`.replace(/^ · /, '');
}
