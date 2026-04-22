import { createFileRoute, Link } from "@tanstack/react-router";
import { ToneBadge } from "@/components/ToneBadge";

export const Route = createFileRoute("/")({
  component: Landing,
});

const demoExamples = [
  {
    src: "Dear Sir,\n\nI hope this message finds you well. I am writing to formally request a meeting to discuss the proposed partnership terms outlined in our previous correspondence.",
    tgt: "आदरणीय महोदय,\n\nमुझे आशा है कि यह संदेश आपको स्वस्थ पाए। मैं हमारे पिछले पत्राचार में उल्लिखित प्रस्तावित साझेदारी की शर्तों पर चर्चा करने के लिए औपचारिक रूप से एक बैठक का अनुरोध करने हेतु लिख रहा हूँ।",
    tone: "Formal",
    intent: "Informational",
    conf: 96,
    from: "English 🇬🇧",
    to: "Hindi 🇮🇳",
  },
];

function Landing() {
  const ex = demoExamples[0];

  return (
    <main>
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-12">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-muted border border-accent/20 text-xs text-accent font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Style-Aware Translation Engine
          </span>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] leading-[1.05] font-bold text-text-primary max-w-3xl">
            Preserve Meaning,
            <br />
            Keep Your Voice.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed">
            The first AI translator that understands tone, formality, and cultural intent — not just
            words. Built for professionals, writers, and global teams.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/translate"
              className="inline-flex items-center justify-center h-12 px-5 rounded-lg bg-accent hover:bg-accent-hover text-accent-foreground font-medium transition-colors"
            >
              Start Translating →
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center justify-center h-12 px-5 rounded-lg border border-accent text-accent hover:bg-accent-muted transition-colors font-medium"
            >
              See an Example
            </a>
          </div>

          <p className="mt-4 text-xs text-text-muted">
            No account needed to try. 100 free translations.
          </p>

          {/* Feature pills */}
          <div className="mt-10 flex gap-2 overflow-x-auto max-w-full pb-2 scrollbar-none">
            {[
              { icon: "🎯", label: "Tone Preservation" },
              { icon: "🌍", label: "50+ Languages" },
              { icon: "📄", label: "Document Upload" },
              { icon: "🎙️", label: "Audio Input" },
            ].map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs text-text-secondary whitespace-nowrap flex-shrink-0"
              >
                <span>{f.icon}</span> {f.label}
              </span>
            ))}
          </div>
        </div>

        {/* Demo preview */}
        <div id="demo" className="mt-16 rounded-xl bg-surface border border-border p-6 lg:p-8 shadow-soft">
          <div className="flex items-center justify-between mb-4 text-xs text-text-secondary">
            <span>{ex.from}  →  {ex.to}</span>
            <span className="font-mono">Example</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-lg bg-surface-elevated border border-border p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Original</div>
              <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{ex.src}</p>
            </div>
            <div className="rounded-lg bg-surface-elevated border border-border p-5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Translation</div>
              <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{ex.tgt}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ToneBadge label={ex.tone} kind="tone" />
            <ToneBadge label={ex.intent} kind="intent" />
            <ToneBadge label="Professional" kind="register" />
            <span className="ml-auto text-xs text-text-secondary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Tone: Formal → Professional
              <span className="font-mono text-accent ml-2">{ex.conf}%</span>
            </span>
          </div>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 lg:px-12 py-10 text-center text-xs text-text-muted">
        Built with style-aware AI. © Satsang.
      </footer>
    </main>
  );
}
