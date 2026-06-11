export function Slider({ label, value, onChange, max = 10 }) {
  return (
    <label className="slider">
      <span>
        {label}
        <strong>{value}{max === 10 ? '/10' : '%'}</strong>
      </span>
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
