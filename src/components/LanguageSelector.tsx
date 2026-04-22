import { useState, useRef, useEffect } from "react";
import { LANGUAGES, type Language } from "@/lib/languages";

type Props = {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  excludeAuto?: boolean;
};

export function LanguageSelector({ value, onChange, label, excludeAuto }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[1];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const list: Language[] = (excludeAuto ? LANGUAGES.filter((l) => l.code !== "auto") : LANGUAGES).filter(
    (l) => l.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      {label && <div className="text-xs text-text-secondary mb-1.5">{label}</div>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-surface-elevated border border-border hover:border-border-bright transition-all text-left"
      >
        <span className="flex items-center gap-2 truncate">
          <span className="text-lg">{current.flag}</span>
          <span className="text-sm text-text-primary truncate">{current.name}</span>
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" className="text-text-secondary flex-shrink-0">
          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-surface-elevated border border-border-bright rounded-lg shadow-soft overflow-hidden anim-fade-in">
          <input
            autoFocus
            placeholder="Search language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 bg-surface border-b border-border text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <div className="max-h-64 overflow-y-auto">
            {list.map((l) => (
              <button
                key={l.code}
                onClick={() => { onChange(l.code); setOpen(false); setSearch(""); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface transition-colors ${
                  l.code === value ? "bg-accent-muted text-accent" : "text-text-primary"
                }`}
              >
                <span className="text-lg">{l.flag}</span>
                <span>{l.name}</span>
              </button>
            ))}
            {list.length === 0 && <div className="px-3 py-4 text-xs text-text-muted text-center">No matches</div>}
          </div>
        </div>
      )}
    </div>
  );
}
