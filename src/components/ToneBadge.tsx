type Props = { label: string; kind?: "tone" | "intent" | "register" | "domain" | "neutral" };

const styles: Record<string, string> = {
  tone: "bg-accent-muted text-accent border-accent/30",
  intent: "bg-[rgba(59,130,246,0.12)] text-info border-info/30",
  register: "bg-[rgba(245,158,11,0.12)] text-warning border-warning/30",
  domain: "bg-surface-elevated text-text-primary border-border-bright",
  neutral: "bg-surface-elevated text-text-secondary border-border",
};

export function ToneBadge({ label, kind = "neutral" }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${styles[kind]}`}>
      {label}
    </span>
  );
}
