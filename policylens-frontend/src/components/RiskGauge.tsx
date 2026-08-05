interface RiskGaugeProps {
  score: number;
  size?: number;
}

function getRiskColor(score: number): string {
  if (score < 34) return "#22c55e";
  if (score < 67) return "#f59e0b";
  if (score < 85) return "#f97316";
  return "#ef4444";
}

function getRiskLabel(score: number): string {
  if (score < 34) return "Low Risk";
  if (score < 67) return "Medium Risk";
  if (score < 85) return "High Risk";
  return "Critical Risk";
}

export function RiskGauge({ score, size = 200 }: RiskGaugeProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * 0.78;
  const strokeWidth = (size / 2) * 0.13;
  const startAngle = -220;
  const endAngle = 40;
  const totalArc = endAngle - startAngle;

  function polarToXY(angleDeg: number, radius: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(start: number, end: number, rr: number) {
    const s = polarToXY(start, rr);
    const e = polarToXY(end, rr);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${rr} ${rr} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const valueAngle = startAngle + (score / 100) * totalArc;
  const color = getRiskColor(score);
  const circumference = (totalArc / 360) * 2 * Math.PI * r;

  const needle = polarToXY(valueAngle, r * 0.65);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`} style={{ overflow: "visible" }}>
        {/* Track */}
        <path
          d={arcPath(startAngle, endAngle, r)}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Colored progress */}
        <path
          d={arcPath(startAngle, valueAngle, r)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
        />
        {/* Zone ticks */}
        {[33, 66, 85].map((pct) => {
          const a = startAngle + (pct / 100) * totalArc;
          const inner = polarToXY(a, r - strokeWidth / 2 - 2);
          const outer = polarToXY(a, r + strokeWidth / 2 + 2);
          return (
            <line key={pct} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#ffffff" strokeWidth={2} />
          );
        })}
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={needle.x} y2={needle.y}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${color}aa)` }}
        />
        <circle cx={cx} cy={cy} r={strokeWidth * 0.4} fill={color} />
        {/* Score text */}
        <text x={cx} y={cy * 0.88} textAnchor="middle" fontSize={size * 0.19} fontWeight="700" fill={color} fontFamily="Inter, sans-serif">
          {score}
        </text>
        <text x={cx} y={cy * 0.88 + size * 0.08} textAnchor="middle" fontSize={size * 0.072} fill="#64748b" fontFamily="Inter, sans-serif">
          Risk Score
        </text>
      </svg>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-semibold" style={{ color }}>{getRiskLabel(score)}</span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Low</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Med</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Critical</span>
        </div>
      </div>
    </div>
  );
}
