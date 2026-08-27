export const queryKeys = {
  topics: {
    all: ['topics'] as const,
    list: (parentId?: number | null) => ['topics', 'list', parentId ?? 'root'] as const,
    search: (q: string) => ['topics', 'search', q] as const,
    recent: ['topics', 'recent'] as const,
  },
  stats: {
    all: ['stats'] as const,
    detail: (topicId?: number | null, since?: string) =>
      ['stats', topicId ?? 'all', since ?? 'week'] as const,
  },
};
