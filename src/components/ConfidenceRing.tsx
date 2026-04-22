type Props = { score: number; size?: number };

export function ConfidenceRing({ score, size = 64 }: Props) {
  const radius = (size - 8) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  const label = score >= 85 ? "High confidence" : score >= 60 ? "Review recommended" : "Low confidence";

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--border)" strokeWidth="4" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
          className="font-mono"
          fill="var(--text-primary)"
          fontSize={size * 0.26}
          fontWeight="500"
        >
          {score}%
        </text>
      </svg>
      <div>
        <div className="text-xs text-text-secondary">Translation Confidence</div>
        <div className="text-sm font-medium" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}
