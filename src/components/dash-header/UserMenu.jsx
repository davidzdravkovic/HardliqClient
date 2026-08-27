import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../../api';

const username = localStorage.getItem('username') || 'User';

export default function UserMenu({ compact = false }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  function handleLogout() {
    setOpen(false);
    clearAuth();
    navigate('/login');
  }

  return (
    <div className={`dash-user-menu ${compact ? 'dash-user-menu-compact' : ''}`} ref={rootRef}>
      {!compact && <span className="dash-username">{username}</span>}
      <div className="dash-user-menu-wrap">
        <button
          type="button"
          className="dash-avatar"
          aria-label="Account settings"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          {username.charAt(0).toUpperCase()}
        </button>

        {open && (
          <div className="dash-user-dropdown" role="menu">
            <p className="dash-user-dropdown-label">{username}</p>
            <button
              type="button"
              className="dash-user-dropdown-item"
              role="menuitem"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
