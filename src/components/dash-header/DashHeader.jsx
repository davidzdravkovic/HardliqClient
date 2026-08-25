import { useEffect, useRef, useState } from 'react';
import UserMenu from './UserMenu';
import SearchResults from './SearchResults';

export default function DashHeader({search, onSearchChange,onSearchSelect, onLogout,onMenuClick, /* MOBILE-V1 */}) {

  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    setOpen(Boolean(search.trim()));
  }, [search]);

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(e) {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', onPointerDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  function handleSelect(item) {
    onSearchSelect?.(item);
    onSearchChange('');
    setOpen(false);
  }

  return (
    <header className="dash-header">
      {/* MOBILE-V1 START */}
      <button
        type="button"
        className="dash-menu-btn mobile-v1-only"
        aria-label="Open navigation menu"
        onClick={onMenuClick}
      >
        <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {/* MOBILE-V1 END */}

      <div className="dash-search-root" ref={rootRef}>
        <div className="dash-search-wrap">
          <span className="dash-search-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
              <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            className="dash-search"
            placeholder="Search folders or tasks…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => search.trim() && setOpen(true)}
            aria-label="Search folders or tasks"
            aria-expanded={open}
            aria-controls="dash-search-results"
            autoComplete="off"
          />
        </div>

        {open && (
          <div id="dash-search-results" className="dash-search-dropdown">
            <SearchResults
              query={search}
              onSelect={handleSelect}
              onClose={() => setOpen(false)}
            />
          </div>
        )}
      </div>

      <div className="dash-header-actions">
        <button type="button" className="dash-icon-btn" aria-label="Notifications" disabled>
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
            <path
              d="M10 3.5a4 4 0 0 0-4 4v2.2l-1.2 2.2h10.4L14 9.7V7.5a4 4 0 0 0-4-4z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path d="M8.5 15a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
        <UserMenu onLogout={onLogout} compact />
      </div>
    </header>
  );
}
