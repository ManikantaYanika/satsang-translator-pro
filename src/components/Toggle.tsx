type Props = { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string };

export function Toggle({ checked, onChange, label, description }: Props) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <div className="min-w-0">
        <div className="text-sm text-text-primary">{label}</div>
        {description && <div className="text-xs text-text-secondary mt-0.5">{description}</div>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
          checked ? "bg-accent" : "bg-border-bright"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}
