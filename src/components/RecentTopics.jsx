import { useQuery } from '@tanstack/react-query';
import { getTaskStats, getTopics } from '../api';
import { queryKeys } from '../query/keys';

function MiniStat({ type, count }) {
  const colors = {
    pending: 'var(--pending)',
    completed: 'var(--task-light)',
    canceled: 'var(--danger)',
  };

  return (
    <span className="recent-topic-mini-stat" style={{ color: colors[type] }} title={type}>
      {count}
    </span>
  );
}

async function fetchRecentTopics() {
  const data = await getTopics(null);
  const roots = (data.items || []).filter((t) => t.type === 'topic').slice(0, 4);
  return Promise.all(
    roots.map(async (topic) => {
      try {
        const stats = await getTaskStats(topic.id);
        return { ...topic, stats };
      } catch {
        return { ...topic, stats: null };
      }
    }),
  );
}

export default function RecentTopics({ onSelectTopic, onViewAll }) {
  const { data: topics = [], isPending: loading } = useQuery({
    queryKey: queryKeys.topics.recent,
    queryFn: fetchRecentTopics,
  });

  if (loading) {
    return (
      <section className="recent-topics">
        <h3 className="recent-topics-title">Recent folders</h3>
        <p className="recent-topics-muted">Loading…</p>
      </section>
    );
  }

  if (topics.length === 0) return null;

  return (
    <section className="recent-topics">
      <h3 className="recent-topics-title">Recent folders</h3>
      <ul className="recent-topics-grid">
        {topics.map((topic) => {
          const stats = topic.stats;
          const total = stats?.totalTasks ?? 0;
          const completedPct =
            total > 0 ? Math.round(((stats?.completed ?? 0) / total) * 100) : 0;

          return (
            <li key={topic.id}>
              <button
                type="button"
                className="recent-topic-card"
                onClick={() => onSelectTopic(topic)}
              >
                <span className="recent-topic-card-icon" aria-hidden="true">
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                    <path
                      d="M1.5 4h5.5l1.2 1.5H14a.5.5 0 0 1 .5.5v6.5a.5.5 0 0 1-.5.5H1.5a.5.5 0 0 1-.5-.5V4.5a.5.5 0 0 1 .5-.5z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span className="recent-topic-card-name">{topic.name}</span>
                <span className="recent-topic-card-count">
                  {total} {total === 1 ? 'task' : 'tasks'}
                </span>
                <span className="recent-topic-card-bar" aria-hidden="true">
                  <span style={{ width: `${completedPct}%` }} />
                </span>
                {stats && total > 0 && (
                  <span className="recent-topic-card-stats">
                    <MiniStat type="pending" count={stats.pending} />
                    <MiniStat type="completed" count={stats.completed} />
                    <MiniStat type="canceled" count={stats.canceled} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <button type="button" className="recent-topics-link" onClick={onViewAll}>
        View all folders
        <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}
