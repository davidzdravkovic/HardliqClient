export function formatDeleteTopicMessage(name, summary) {
  if (!summary || summary.totalCount === 0) {
    return `Delete "${name}"? It's empty — only this folder will be removed.`;
  }

  const parts = [];
  if (summary.folderCount > 0) {
    parts.push(`${summary.folderCount} folder${summary.folderCount === 1 ? '' : 's'}`);
  }
  if (summary.taskCount > 0) {
    parts.push(`${summary.taskCount} task${summary.taskCount === 1 ? '' : 's'}`);
  }

  return `Delete "${name}" and everything inside (${parts.join(', ')})? Nested items at all levels will be removed.`;
}

export function formatDeleteTaskMessage(name) {
  return `Delete "${name}"? This can't be undone.`;
}
