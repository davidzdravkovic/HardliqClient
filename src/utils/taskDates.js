export function formatTaskDate(value) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export function buildTaskTimeline({ createdAt, completedAt, canceledAt, status }) {
  const entries = [];
  const started = formatTaskDate(createdAt);
  if (started) {
    entries.push({ key: 'started', label: 'Started', value: started });
  }

  const normalized = (status || 'Pending').toLowerCase();
  if (normalized === 'completed') {
    const completed = formatTaskDate(completedAt);
    if (completed) entries.push({ key: 'completed', label: 'Completed', value: completed });
  } else if (normalized === 'canceled') {
    const canceled = formatTaskDate(canceledAt);
    if (canceled) entries.push({ key: 'canceled', label: 'Cancelled', value: canceled });
  }

  return entries;
}
