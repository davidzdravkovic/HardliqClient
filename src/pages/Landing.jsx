import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Landing() {
  return (
    <div className="page landing">
      <nav className="nav">
        <Logo />
        <div className="nav-links">
          <Link to="/login" className="btn btn-ghost">Log in</Link>
          <Link to="/register" className="btn btn-primary">Get started</Link>
        </div>
      </nav>

      <header className="hero">
        <img src="/favicon.svg" alt="" className="hero-logo" aria-hidden="true" />
        <p className="eyebrow">Your personal workspace</p>
        <h1>Organize work in topics. Get it done in tasks.</h1>
        <p className="hero-sub">
          Stop juggling scattered lists. Group related work into topics, add tasks
          where they belong, and open one level at a time so you always know what
          to focus on next.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary">Create free account</Link>
          <Link to="/login" className="btn btn-ghost">I already have an account</Link>
        </div>
      </header>

      <section className="features">
        <article className="feature-card">
          <h3>Work in layers, not one long list</h3>
          <p>
            Create topics inside topics—like folders for projects, areas, or clients.
            Expand only what you need. The rest stays out of the way.
          </p>
        </article>
        <article className="feature-card">
          <h3>Tasks live where the context is</h3>
          <p>
            When a topic is ready for action, add tasks directly under it. Name,
            describe, and track status without losing sight of the bigger picture.
          </p>
        </article>
        <article className="feature-card">
          <h3>Private by default</h3>
          <p>
            Sign in to your own workspace. Every topic and task belongs to you—
            nothing shared, nothing mixed with anyone else&apos;s work.
          </p>
        </article>
      </section>

      <footer className="footer">
        <p>TaskManager — simple structure for the work that matters.</p>
      </footer>
    </div>
  );
}
