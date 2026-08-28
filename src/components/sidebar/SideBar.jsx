import TopicTree from './TopicTree';

export default function SideBar({ selectedId, onSelect, onNewTopic }) {
  return (
    <>
      <div className="sidebar-section">
        <p className="sidebar-title">Overview</p>
        <button
          type="button"
          className={`tree-all ${selectedId == null ? 'is-active' : ''}`}
          onClick={() => onSelect(null)}
        >
          <span className="tree-all-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path
                d="M2.5 7.2 8 3.2l5.5 4v5.3a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V7.2z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="tree-all-text">All folders</span>
        </button>
      </div>
      <div className="sidebar-section sidebar-section-topics">
        <p className="sidebar-title">Folders</p>
        <TopicTree
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </div>
      <div className="sidebar-footer">
        <button type="button" className="sidebar-footer-btn" onClick={onNewTopic}>
          + New folder
        </button>
        <button type="button" className="sidebar-footer-btn sidebar-footer-btn-muted" disabled>
          <span className="sidebar-footer-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
              <path
                d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.4 3.4l.85.85M11.75 11.75l.85.85M3.4 12.6l.85-.85M11.75 4.25l.85-.85"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          Settings
        </button>
      </div>
    </>
  );
}
