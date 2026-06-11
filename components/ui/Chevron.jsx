export function Chevron({ open }) {
  return (
    <svg className={`chevron ${open ? 'open' : ''}`} viewBox="0 0 24 24" width="16" height="16">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
