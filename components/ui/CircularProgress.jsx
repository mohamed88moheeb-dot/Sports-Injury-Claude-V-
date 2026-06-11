export function CircularProgress({ value }) {
  return (
    <div className="circle-progress" style={{ '--value': `${value * 3.6}deg` }}>
      <span>{value}%</span>
    </div>
  );
}
