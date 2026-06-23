import { useEffect, useRef, useState } from 'react';

export default function UserMenu({ username, onLogout, compact = false }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function handleLogout() {
    setOpen(false);
    onLogout();
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
