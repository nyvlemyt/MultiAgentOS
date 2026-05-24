export function Sparkline({ data, width = 80, height = 24, stroke }: { data: number[]; width?: number; height?: number; stroke?: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(1, max - min);
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${(i * step).toFixed(2)},${(height - ((v - min) / range) * height).toFixed(2)}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={points} fill="none" stroke={stroke ?? 'var(--accent)'} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
