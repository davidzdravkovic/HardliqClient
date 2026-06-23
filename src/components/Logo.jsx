import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }) {
  const mark = <img src="/favicon.svg" alt="" className="logo-mark" aria-hidden="true" />;
  const label = <span>TaskManager</span>;

  if (to) {
    return (
      <Link to={to} className="logo">
        {mark}
        {label}
      </Link>
    );
  }

  return (
    <span className="logo">
      {mark}
      {label}
    </span>
  );
}
