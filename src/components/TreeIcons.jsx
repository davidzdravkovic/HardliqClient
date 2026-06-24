export function FolderIcon({ open = false }) {
  if (open) {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M1.5 4.5h5l1.2 1.5H14.5v7.5H1.5V4.5z" fill="#a68b5b" />
        <path d="M1.5 3.5h5.3l1.2 1.5H14.5v1H6.5L5.3 4.5H1.5v-1z" fill="#c4a574" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1.5 4h5.5l1.2 1.5H14a.5.5 0 0 1 .5.5v6.5a.5.5 0 0 1-.5.5H1.5a.5.5 0 0 1-.5-.5V4.5a.5.5 0 0 1 .5-.5z" fill="#a68b5b" />
      <path d="M1.5 3h5.3l1.2 1.5H14v1H6.7L5.5 3H1.5V3z" fill="#c4a574" />
    </svg>
  );
}

export function TaskIcon({ status }) {
  const normalized = (status || 'Pending').toLowerCase();

  if (normalized === 'completed') {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.5" stroke="#5f9b88" strokeWidth="1.5" />
        <path d="M5.5 8l1.8 1.8L10.5 6.5" stroke="#5f9b88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (normalized === 'canceled') {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.5" stroke="#e85d6c" strokeWidth="1.5" />
        <path d="M6 6l4 4M10 6l-4 4" stroke="#e85d6c" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="#6d9eeb" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2" fill="#6d9eeb" />
    </svg>
  );
}
