const SHORTCUTS = [
  { keys: ['/', 'Ctrl', 'K'], label: 'Focus search' },
  { keys: ['Esc'], label: 'Close menus, search, or dialogs' },
  { keys: ['?'], label: 'Show keyboard shortcuts' },
  { keys: ['↑', '↓'], label: 'Move selection in folder contents' },
  { keys: ['Ctrl', '↑'], label: 'Move item up in folder contents' },
  { keys: ['Ctrl', '↓'], label: 'Move item down in folder contents' },
  { keys: ['Enter'], label: 'Open selected folder contents item' },
];

function KeyCombo({ keys }) {
  return (
    <span className="kbd-combo">
      {keys.map((key) => (
        <kbd key={key} className="kbd-key">{key}</kbd>
      ))}
    </span>
  );
}

export default function KeyboardShortcutsHelp({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="confirm-overlay kbd-help-overlay" onClick={onClose}>
      <div
        className="confirm-dialog kbd-help-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kbd-help-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="kbd-help-title" className="confirm-dialog-title">Keyboard shortcuts</h2>
        <p className="confirm-dialog-message">Works when you are not typing in a field.</p>
        <ul className="kbd-help-list">
          {SHORTCUTS.map((item) => (
            <li key={item.label} className="kbd-help-row">
              <KeyCombo keys={item.keys} />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
        <div className="confirm-dialog-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
