import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import './landing.css';

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M3 8h9M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CardArrow() {
  return (
    <span className="landing-feature-arrow" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
        <path d="M4 8h7M9 5.5 11.5 8 9 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function FolderStatsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path d="M4 7.5 6.2 5h6.3l1.8 2.2H20v10.3H4V7.5z" stroke="#a78bfa" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="7" y="11" width="3" height="5" rx="0.5" fill="#a78bfa" opacity="0.85" />
      <rect x="11.5" y="13" width="3" height="3" rx="0.5" fill="#34d399" opacity="0.9" />
      <rect x="16" y="12" width="3" height="4" rx="0.5" fill="#6d9eeb" opacity="0.75" />
    </svg>
  );
}

function PeriodIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="#34d399" strokeWidth="1.5" />
      <path d="M4 9.5h16M8 3v3M16 3v3" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 14.5h2.5v4H8v-4zM13.5 12h2.5v6.5h-2.5V12z" fill="#34d399" opacity="0.85" />
    </svg>
  );
}

function ControlIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.5" stroke="#f472b6" strokeWidth="1.5" />
      <path d="M12 8v4l2.8 1.6" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill="#f472b6" />
    </svg>
  );
}

function MiniStatsPreview() {
  return (
    <div className="landing-stats-preview" aria-hidden="true">
      <div className="landing-stats-preview-bar">
        <span className="landing-stats-seg landing-stats-seg--done" style={{ flexGrow: 4 }} />
        <span className="landing-stats-seg landing-stats-seg--pending" style={{ flexGrow: 2 }} />
        <span className="landing-stats-seg landing-stats-seg--cancel" style={{ flexGrow: 1 }} />
      </div>
      <div className="landing-stats-preview-piles">
        <div><strong>2</strong><span>Pending</span></div>
        <div><strong>4</strong><span>Done</span></div>
        <div><strong>1</strong><span>Cancelled</span></div>
        <div><strong>7</strong><span>Total</span></div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="landing-page">
      <div className="landing-bg-grid" aria-hidden="true" />
      <div className="landing-glow landing-glow--left" aria-hidden="true" />
      <div className="landing-glow landing-glow--right" aria-hidden="true" />

      <div className="landing-glow landing-glow--center" aria-hidden="true" />

      <nav className="landing-nav">
        <Logo />
        <div className="landing-nav-actions">
          <Link to="/login" className="landing-btn landing-btn--ghost">Log in</Link>
          <Link to="/register" className="landing-btn landing-btn--primary">
            Sign up
            <ArrowIcon />
          </Link>
        </div>
      </nav>

      <main className="landing-main">
        <section className="landing-hero">
          <p className="landing-badge">
            Track work. See progress.
          </p>

          <h1 className="landing-headline">
            You do the work.
            <br />
            The app keeps the <span className="landing-gradient landing-gradient--score">score.</span>
          </h1>

          <p className="landing-lead">
            Productivity is not about doing more. It is about knowing what is open,
            what you closed, and whether you are actually moving. Hardliq tracks
            your tasks as you go and shows you that picture while it is still useful.
          </p>

          <div className="landing-hero-cta">
            <Link to="/register" className="landing-btn landing-btn--primary landing-btn--lg">
              Sign up
              <ArrowIcon />
            </Link>
            <Link to="/login" className="landing-btn landing-btn--secondary landing-btn--lg">
              Log in
            </Link>
          </div>

          <p className="landing-trust">
            Free. No card.
          </p>
        </section>

        <section className="landing-features" aria-label="What it does">
          <article className="landing-feature landing-feature--violet">
            <div className="landing-feature-icon">
              <FolderStatsIcon />
            </div>
            <h2>Your output, counted</h2>
            <p>
              Add a task, finish it, cancel it — the totals change. You always
              know how much is waiting on you and how much you have already cleared.
            </p>
            <CardArrow />
          </article>

          <article className="landing-feature landing-feature--mint">
            <div className="landing-feature-icon">
              <PeriodIcon />
            </div>
            <h2>Progress for a real time range</h2>
            <p>
              Look at this week or this month. Did you close things or just add more?
              That answer is easier when the numbers are already there.
            </p>
            <CardArrow />
          </article>

          <article className="landing-feature landing-feature--rose">
            <div className="landing-feature-icon">
              <ControlIcon />
            </div>
            <h2>You stay in control</h2>
            <p>
              The stats reflect what you did, not what an algorithm thinks you
              should do. You decide what to take on, finish, or drop — and you
              see the result immediately.
            </p>
            <CardArrow />
          </article>
        </section>

        <section className="landing-proof">
          <div className="landing-proof-lead">
            <span className="landing-proof-mark" aria-hidden="true">📊</span>
            <h2>
              Why tracking <span className="landing-gradient landing-gradient--gold">helps</span>
            </h2>
          </div>
          <p className="landing-proof-body">
            When work is invisible, you overcommit. When it is visible, you
            correct course — finish what is open, stop piling on, or admit
            something is not happening. That is how productivity goes up:
            fewer blind spots, better calls, earlier.
          </p>
          <div className="landing-proof-visual">
            <MiniStatsPreview />
            <p className="landing-proof-caption">Pending · done · cancelled · total</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>Hardliq</p>
      </footer>
    </div>
  );
}
