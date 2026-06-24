import { useEffect, useState } from 'react';
import { getTaskStats } from '../api';

function getSinceForPeriod(period) {
  const now = new Date();
  if (period === 'month') {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  }
  return undefined;
}

function formatSinceLabel(isoDate, period) {
  if (period === 'month') return 'This month';
  if (!isoDate) return 'This week';
  const since = new Date(isoDate);
  const now = new Date();
  const sameWeek =
    since.getUTCFullYear() === now.getUTCFullYear() &&
    since.getUTCMonth() === now.getUTCMonth() &&
    Math.abs(now - since) < 7 * 24 * 60 * 60 * 1000;
  if (sameWeek) return 'This week';
  return `Since ${since.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

function StatIcon({ type }) {
  if (type === 'pending') {
    return (
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'completed') {
    return (
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="m6.5 10 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'total') {
    return (
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="11" y="4" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="4" y="11" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="11" y="11" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const PILE_CONFIG = [
  { key: 'pending', countKey: 'pending', label: 'Pending', pileClass: 'stats-pile-pending', stackClass: 'stats-stack-pending' },
  { key: 'completed', countKey: 'completed', label: 'Completed', pileClass: 'stats-pile-completed', stackClass: 'stats-stack-completed' },
  { key: 'canceled', countKey: 'canceled', label: 'Cancelled', pileClass: 'stats-pile-canceled', stackClass: 'stats-stack-canceled' },
];

function StatsMetrics({ stats, period, compact = false, panel = false }) {
  const sinceLabel = formatSinceLabel(stats.executedSince, period);
  const executedThisPeriod = (stats.completedSince ?? 0) + (stats.canceledSince ?? 0);
  const progressPct =
    stats.totalTasks > 0 ? Math.round((stats.completed / stats.totalTasks) * 100) : 0;

  const piles = [
    ...PILE_CONFIG.map((item) => ({
      ...item,
      count: stats[item.countKey] ?? 0,
    })),
    {
      key: 'total',
      count: stats.totalTasks ?? 0,
      label: 'Total',
      pileClass: 'stats-pile-total',
      stackClass: 'stats-stack-total',
    },
  ];

  const stackPiles = piles.filter((p) => p.key !== 'total' && p.count > 0);
  const stackLabel = stackPiles.map((p) => `${p.count} ${p.label.toLowerCase()}`).join(', ');

  if (stats.totalTasks === 0) {
    return <p className="workspace-stats-empty">No tasks yet.</p>;
  }

  return (
    <>
      <div
        className="stats-progress"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${progressPct}% completed`}
      >
        {stackPiles.length > 0 ? (
          <div className="stats-stack" aria-hidden="true">
            {stackPiles.map((pile) => (
              <span
                key={pile.key}
                className={`stats-stack-segment ${pile.stackClass}`}
                style={{ flexGrow: pile.count }}
                title={`${pile.count} ${pile.label.toLowerCase()}`}
              />
            ))}
          </div>
        ) : (
          <span className="stats-progress-fill" style={{ width: `${progressPct}%` }} />
        )}
      </div>

      <ul
        className={`stats-piles${compact ? ' stats-piles-compact' : ''}${panel ? ' stats-piles-panel' : ''}`}
        aria-label={stackLabel || 'Task breakdown'}
      >
        {piles.map((pile) => (
          <li key={pile.key} className={`stats-pile ${pile.pileClass}`}>
            <span className="stats-pile-icon">
              <StatIcon type={pile.key} />
            </span>
            <span className="stats-pile-count">{pile.count}</span>
            <span className="stats-pile-label">{pile.label}</span>
          </li>
        ))}
      </ul>

      {executedThisPeriod > 0 && !panel && (
        <p className="workspace-stats-foot">
          {sinceLabel}: {stats.completedSince} completed, {stats.canceledSince} cancelled
        </p>
      )}
    </>
  );
}

export default function WorkspaceStats({ topicId, refreshKey, children, headerMenu }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const isFolderView = topicId != null;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getTaskStats(topicId, getSinceForPeriod(period))
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [topicId, refreshKey, period]);

  const title = stats?.scope === 'folder' && stats?.topicName ? stats.topicName : 'All topics';
  const subtitle =
    stats?.scope === 'folder'
      ? 'Tasks and progress in this folder'
      : 'Overview of all your tasks and progress';

  const periodSelect = (
    <select
      className="stats-period-select folder-workspace-period"
      value={period}
      onChange={(e) => setPeriod(e.target.value)}
      aria-label="Time period"
    >
      <option value="week">This week</option>
      <option value="month">This month</option>
    </select>
  );

  const folderStatsPanel = (content, { loading: isLoading = false } = {}) => (
    <aside
      className={`folder-stats-panel${isLoading ? ' workspace-stats-loading' : ''}`}
      aria-label="Task statistics"
      aria-hidden={isLoading || undefined}
    >
      {content}
    </aside>
  );

  if (loading) {
    if (isFolderView) {
      return (
        <div className="folder-workspace-layout">
          <section className="folder-workspace">
            <header className="folder-workspace-header">
              <div className="folder-workspace-hero workspace-stats-loading">
                <p>Loading…</p>
              </div>
            </header>
            {children}
          </section>
          {folderStatsPanel(<div className="stats-progress stats-progress-skeleton" />, { loading: true })}
        </div>
      );
    }

    return (
      <section className="stats-card workspace-stats workspace-stats-loading" aria-label="Task statistics">
        <div className="stats-progress stats-progress-skeleton" aria-hidden="true" />
        <p>Loading stats…</p>
      </section>
    );
  }

  if (!stats) return null;

  const headerBlock = (
    <div className="workspace-stats-top">
      <div>
        <h2 className="workspace-stats-title">{title}</h2>
        <p className="workspace-stats-subtitle">{subtitle}</p>
      </div>
      <select
        className="stats-period-select"
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        aria-label="Time period"
      >
        <option value="week">This week</option>
        <option value="month">This month</option>
      </select>
    </div>
  );

  if (isFolderView) {
    return (
      <div className="folder-workspace-layout">
        <section className="folder-workspace">
          <header className="folder-workspace-header">
            <div className="folder-workspace-hero">
              <h2 className="folder-workspace-title">{title}</h2>
              <p className="folder-workspace-subtitle">{subtitle}</p>
              {periodSelect}
            </div>
            {headerMenu && (
              <div className="folder-workspace-header-actions">{headerMenu}</div>
            )}
          </header>
          {children}
        </section>
        {folderStatsPanel(<StatsMetrics stats={stats} period={period} panel />)}
      </div>
    );
  }

  return (
    <section className="stats-card workspace-stats" aria-label="Task statistics">
      {headerBlock}
      <StatsMetrics stats={stats} period={period} />
    </section>
  );
}
