'use client';

export function PainSlider({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <label className="field">
      <span style={{ fontSize: 28, fontWeight: 700 }}>{value}<span className="small">/10</span></span>
      <input type="range" min={0} max={10} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="scale"><span>No pain</span><span>Worst imaginable</span></span>
    </label>
  );
}
