import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { AUTH_TOKEN_KEY, AUTH_USERNAME_KEY, clearSession, login } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === '1';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function dismissExpiredNotice() {
    searchParams.delete('expired');
    setSearchParams(searchParams, { replace: true });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login({username, password});
      clearSession();
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USERNAME_KEY, data.username);
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <Logo />
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to continue to your workspace.</p>

        <form onSubmit={handleSubmit} className="form">
          {sessionExpired && (
            <p className="auth-notice" role="status">
              Your session expired. Please sign in again.
              <button type="button" className="auth-notice-dismiss" onClick={dismissExpiredNotice}>
                Dismiss
              </button>
            </p>
          )}
          {error && <p className="error">{error}</p>}
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
