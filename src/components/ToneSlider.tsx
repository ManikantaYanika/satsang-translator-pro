type Props = {
  value: number;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
  steps?: { value: number; label: string }[];
  valueLabel?: string;
};

export function ToneSlider({ value, onChange, leftLabel, rightLabel, steps, valueLabel }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-xs">
        <span className="text-text-secondary">{leftLabel}</span>
        {valueLabel && (
          <span className="px-2 py-0.5 rounded-md bg-accent-muted text-accent font-mono">
            {value} — {valueLabel}
          </span>
        )}
        <span className="text-text-secondary">{rightLabel}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border accent-[var(--accent)]"
        style={{
          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${value}%, var(--border) ${value}%, var(--border) 100%)`,
        }}
      />
      {steps && (
        <div className="flex justify-between mt-2 text-[10px] text-text-muted">
          {steps.map((s) => (
            <span key={s.value}>{s.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
