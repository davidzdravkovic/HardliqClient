import { useEffect, useState } from 'react';
import { getTaskStats, getTopics } from '../api';

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

export default function RecentTopics({ refreshKey, onSelectTopic, onViewAll }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getTopics(null)
      .then(async (data) => {
        const roots = (data.items || []).filter((t) => t.type === 'topic').slice(0, 4);
        const withStats = await Promise.all(
          roots.map(async (topic) => {
            try {
              const stats = await getTaskStats(topic.id);
              return { ...topic, stats };
            } catch {
              return { ...topic, stats: null };
            }
          })
        );
        if (!cancelled) setTopics(withStats);
      })
      .catch(() => {
        if (!cancelled) setTopics([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) {
    return (
      <section className="recent-topics">
        <h3 className="recent-topics-title">Recent topics</h3>
        <p className="recent-topics-muted">Loading…</p>
      </section>
    );
  }

  if (topics.length === 0) return null;

  return (
    <section className="recent-topics">
      <h3 className="recent-topics-title">Recent topics</h3>
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
        View all topics
        <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}
