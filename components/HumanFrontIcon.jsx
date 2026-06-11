export default function HumanFrontIcon({ className = '', size = 'medium' }) {
  return (
    <img
      src="/human_front.svg"
      alt="Human body front view"
      className={`human-front-icon human-front-${size} ${className}`}
    />
  );
}
