import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ToneBadge } from "@/components/ToneBadge";
import { ConfidenceRing } from "@/components/ConfidenceRing";
import { FileDropzone } from "@/components/FileDropzone";
import { AudioRecorder } from "@/components/AudioRecorder";
import { ToneSlider } from "@/components/ToneSlider";
import { Toggle } from "@/components/Toggle";
import { DOMAINS, getLang } from "@/lib/languages";
import { translateFn } from "@/server/translate.functions";
import { getSessionId, getDemoUsed, incDemoUsed, DEMO_LIMIT } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/translate")({
  component: TranslatePage,
  head: () => ({
    meta: [
      { title: "Translate — Satsang" },
      { name: "description", content: "Translate text, documents, and audio with tone and style preservation." },
    ],
  }),
});

const PLACEHOLDERS = [
  "Type or paste text to translate...",
  "Dear Sir, I hope this message finds you well...",
  "We're excited to announce our new product launch...",
];

type Result = {
  translated_text: string;
  tone_detected: string;
  intent_detected: string;
  register_detected: string;
  confidence_score: number;
  translator_notes?: string;
};

type GlossaryTerm = { source_term: string; target_term: string };

function TranslatePage() {
  const { user } = useAuth();
  const translate = useServerFn(translateFn);

  const [source, setSource] = useState("auto");
  const [target, setTarget] = useState("hi");
  const [input, setInput] = useState("");
  const [sourceFile, setSourceFile] = useState<string | null>(null);
  const [tab, setTab] = useState<"text" | "document" | "audio">("text");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  // tone settings
  const [formality, setFormality] = useState(50);
  const [preserveStyle, setPreserveStyle] = useState(true);
  const [culturalAdapt, setCulturalAdapt] = useState(true);
  const [literalness, setLiteralness] = useState(60);
  const [domain, setDomain] = useState("general");
  const [settingsOpen, setSettingsOpen] = useState(true);

  // glossary
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [addingTerm, setAddingTerm] = useState(false);
  const [termSrc, setTermSrc] = useState("");
  const [termTgt, setTermTgt] = useState("");

  const [demoUsed, setDemoUsedState] = useState(0);

  useEffect(() => {
    setDemoUsedState(getDemoUsed());
    const t = setInterval(() => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length), 3000);
    return () => clearInterval(t);
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") { e.preventDefault(); swap(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, source, target, result]);

  const formalityLabel =
    formality < 25 ? "Casual" : formality < 50 ? "Neutral" : formality < 75 ? "Professional" : "Formal";

  const charCount = input.length;
  const charColor = charCount >= 5000 ? "text-danger" : charCount >= 4000 ? "text-warning" : "text-text-muted";

  function swap() {
    if (source === "auto") { toast.info("Can't swap while source is set to auto-detect"); return; }
    setSource(target);
    setTarget(source);
    if (result) { setInput(result.translated_text); setResult(null); }
  }

  async function run() {
    if (!input.trim()) { toast.info("Add some text to translate"); return; }
    if (input.length > 5000) { toast.error("Text exceeds 5000 characters"); return; }

    // demo limit check (only for unauthenticated users)
    if (!user && demoUsed >= DEMO_LIMIT) {
      toast.error("Demo limit reached. Sign in to continue.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await translate({
        data: {
          source_text: input,
          source_language: source === "auto" ? "auto-detect" : getLang(source).name,
          target_language: getLang(target).name,
          formality_level: formality,
          domain,
          preserve_style: preserveStyle,
          cultural_adaptation: culturalAdapt,
          literal_vs_natural: literalness,
          glossary_terms: glossary,
        },
      });

      if (res.error || !res.translated_text) {
        toast.error(res.error || "Translation failed");
        return;
      }

      const r: Result = {
        translated_text: res.translated_text,
        tone_detected: res.tone_detected,
        intent_detected: res.intent_detected,
        register_detected: res.register_detected,
        confidence_score: res.confidence_score,
        translator_notes: res.translator_notes,
      };
      setResult(r);

      // save
      await supabase.from("translations").insert({
        user_id: user?.id ?? null,
        session_id: getSessionId(),
        source_language: getLang(source).name,
        target_language: getLang(target).name,
        source_text: input,
        translated_text: r.translated_text,
        input_type: tab,
        tone_detected: r.tone_detected,
        intent_detected: r.intent_detected,
        register_detected: r.register_detected,
        confidence_score: r.confidence_score,
        formality_level: formality,
        domain,
        source_file_name: sourceFile,
        translator_notes: r.translator_notes,
      });

      if (!user) setDemoUsedState(incDemoUsed());
      toast.success("Translated");
    } catch (e) {
      console.error(e);
      toast.error("Translation failed");
    } finally {
      setLoading(false);
    }
  }

  async function copyOutput() {
    if (!result) return;
    await navigator.clipboard.writeText(result.translated_text);
    toast.success("Translation copied!");
  }

  function speak() {
    if (!result) return;
    const u = new SpeechSynthesisUtterance(result.translated_text);
    u.lang = target;
    speechSynthesis.speak(u);
  }

  async function save() {
    if (!result) return;
    // mark last translation as saved (best effort)
    const { data } = await supabase
      .from("translations")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1);
    if (data?.[0]) {
      await supabase.from("translations").update({ is_saved: true }).eq("id", data[0].id);
      toast.success("Saved to history");
    }
  }

  function addTerm() {
    if (!termSrc.trim() || !termTgt.trim()) return;
    setGlossary((g) => [...g, { source_term: termSrc.trim(), target_term: termTgt.trim() }]);
    setTermSrc(""); setTermTgt(""); setAddingTerm(false);
  }

  return (
    <main className="max-w-7xl mx-auto px-5 lg:px-12 py-6 lg:py-10">
      {/* Demo banner */}
      {!user && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-[rgba(245,158,11,0.08)] px-4 py-3 text-sm text-text-primary flex flex-wrap items-center gap-2">
          <span>⚡</span>
          <span>
            Demo mode active — {DEMO_LIMIT - demoUsed} of {DEMO_LIMIT} free translations left this session.
          </span>
          <a href="/settings" className="ml-auto text-accent hover:underline text-xs">Add your API key →</a>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_320px]">
        {/* INPUT */}
        <section className="rounded-xl bg-surface border border-border p-5 lg:p-6 flex flex-col gap-4">
          <div className="flex items-end gap-2">
            <LanguageSelector value={source} onChange={setSource} label="Source Language" />
            <button
              type="button"
              onClick={swap}
              className="mb-0.5 w-10 h-10 rounded-lg bg-surface-elevated border border-border hover:border-accent text-text-secondary hover:text-accent transition-colors flex items-center justify-center"
              aria-label="Swap languages"
              title="Swap (Ctrl+L)"
            >↔</button>
            <LanguageSelector value={target} onChange={setTarget} label="Target Language" excludeAuto />
          </div>

          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 5500))}
              placeholder={PLACEHOLDERS[placeholderIdx]}
              className="w-full min-h-[220px] p-4 pb-10 rounded-lg bg-surface-elevated border border-border focus:border-accent outline-none text-sm text-text-primary placeholder:text-text-muted resize-y transition-colors"
            />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] pointer-events-none">
              <span className={`font-mono ${charColor}`}>{charCount} / 5000</span>
              {input && (
                <button
                  onClick={() => { setInput(""); setSourceFile(null); }}
                  className="pointer-events-auto w-5 h-5 rounded-full bg-border hover:bg-danger text-text-secondary hover:text-white transition-colors text-xs"
                  aria-label="Clear"
                >×</button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-surface-elevated border border-border">
            {[
              { k: "text", l: "✏️ Text" },
              { k: "document", l: "📄 Document" },
              { k: "audio", l: "🎙️ Audio" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k as any)}
                className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${
                  tab === t.k ? "bg-accent text-accent-foreground font-medium" : "text-text-secondary hover:text-text-primary"
                }`}
              >{t.l}</button>
            ))}
          </div>

          {tab === "document" && (
            <FileDropzone
              onText={(txt, name) => {
                setInput(txt.slice(0, 5500));
                setSourceFile(name);
                setTab("text");
                toast.success(`Extracted ${txt.length} characters from ${name}`);
              }}
            />
          )}
          {tab === "audio" && (
            <AudioRecorder
              onTranscript={(txt) => {
                setInput(txt.slice(0, 5500));
                setTab("text");
                toast.success("Transcript loaded");
              }}
            />
          )}

          <button
            disabled={loading || !input.trim()}
            onClick={run}
            className="relative h-[52px] w-full rounded-lg bg-accent hover:bg-accent-hover disabled:bg-surface-elevated disabled:text-text-muted disabled:cursor-not-allowed text-accent-foreground font-medium transition-colors overflow-hidden"
          >
            {loading ? (
              <>
                <span className="absolute inset-0 anim-progress opacity-60" />
                <span className="relative">Translating...</span>
              </>
            ) : (
              <>Translate → <span className="ml-2 text-xs opacity-60 font-mono">⌘↵</span></>
            )}
          </button>
        </section>

        {/* OUTPUT */}
        <section className="rounded-xl bg-surface border border-border p-5 lg:p-6 flex flex-col gap-4 relative">
          <div className="flex items-center justify-between">
            <div className="text-xs text-text-secondary uppercase tracking-wider">Translation</div>
            {result && (
              <button
                onClick={copyOutput}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-muted text-accent text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <span>📋</span> Copy
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[220px] p-4 rounded-lg bg-surface-elevated border border-border">
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-3 rounded bg-border anim-pulse-soft" style={{ width: `${90 - i * 12}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            ) : result ? (
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap anim-fade-in">
                {result.translated_text}
              </p>
            ) : (
              <p className="text-sm text-text-muted italic">Translation will appear here...</p>
            )}
          </div>

          {result && (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={run} className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:border-border-bright text-text-secondary hover:text-text-primary transition-colors">🔄 Regenerate</button>
                <button onClick={speak} className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:border-border-bright text-text-secondary hover:text-text-primary transition-colors">🔊 Listen</button>
                <button onClick={save} className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:border-border-bright text-text-secondary hover:text-text-primary transition-colors">💾 Save</button>
              </div>

              <div className="pt-3 border-t border-border">
                <ConfidenceRing score={result.confidence_score} />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <ToneBadge label={result.tone_detected} kind="tone" />
                <ToneBadge label={result.intent_detected} kind="intent" />
                <ToneBadge label={result.register_detected} kind="register" />
              </div>

              {result.translator_notes && (
                <div className="text-xs text-text-secondary p-3 rounded-lg bg-surface-elevated border border-border">
                  <span className="text-text-muted">Note: </span>
                  {result.translator_notes}
                </div>
              )}
            </>
          )}
        </section>

        {/* TONE SETTINGS */}
        <aside className="rounded-xl bg-surface border border-border p-5 lg:p-6 flex flex-col gap-5 h-fit lg:sticky lg:top-20">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-medium text-text-primary">Translation Style</h2>
            <button
              onClick={() => setSettingsOpen((o) => !o)}
              className="text-text-secondary hover:text-text-primary lg:hidden"
              aria-label="Toggle settings"
            >{settingsOpen ? "–" : "+"}</button>
          </div>

          {(settingsOpen || true) && (
            <div className="flex flex-col gap-5">
              <div>
                <div className="text-xs text-text-secondary mb-2">Formality Level</div>
                <ToneSlider
                  value={formality}
                  onChange={setFormality}
                  leftLabel="Casual"
                  rightLabel="Formal"
                  valueLabel={formalityLabel}
                  steps={[
                    { value: 0, label: "Casual" },
                    { value: 33, label: "Neutral" },
                    { value: 66, label: "Pro" },
                    { value: 100, label: "Formal" },
                  ]}
                />
              </div>

              <Toggle
                checked={preserveStyle}
                onChange={setPreserveStyle}
                label="Preserve Original Style"
                description="Maintains rhetorical structure and sentence rhythm"
              />
              <Toggle
                checked={culturalAdapt}
                onChange={setCulturalAdapt}
                label="Cultural Context Adaptation"
                description="Adapts idioms and references for target culture"
              />

              <div>
                <div className="text-xs text-text-secondary mb-2">Literal vs Natural</div>
                <ToneSlider
                  value={literalness}
                  onChange={setLiteralness}
                  leftLabel="Literal"
                  rightLabel="Natural"
                />
                <div className="text-[11px] text-text-muted mt-1">How closely to follow word-for-word vs rephrase naturally</div>
              </div>

              <div>
                <label className="text-xs text-text-secondary block mb-1.5">Domain / Context</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-text-primary outline-none focus:border-accent"
                >
                  {DOMAINS.map((d) => (
                    <option key={d.value} value={d.value}>{d.icon} {d.label}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-text-primary">Custom Glossary</div>
                  <button
                    onClick={() => setAddingTerm((a) => !a)}
                    className="w-6 h-6 rounded-md bg-accent-muted text-accent hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                  >+</button>
                </div>
                {addingTerm && (
                  <div className="mb-2 space-y-2">
                    <input
                      placeholder="Original term"
                      value={termSrc}
                      onChange={(e) => setTermSrc(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md bg-surface-elevated border border-border text-xs outline-none focus:border-accent"
                    />
                    <input
                      placeholder="Preferred translation"
                      value={termTgt}
                      onChange={(e) => setTermTgt(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md bg-surface-elevated border border-border text-xs outline-none focus:border-accent"
                    />
                    <button
                      onClick={addTerm}
                      className="w-full py-1.5 rounded-md bg-accent text-accent-foreground text-xs font-medium"
                    >Add term</button>
                  </div>
                )}
                <div className="space-y-1.5">
                  {glossary.length === 0 && <div className="text-[11px] text-text-muted">No terms yet.</div>}
                  {glossary.map((t, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-surface-elevated border border-border text-xs">
                      <span className="truncate">
                        <span className="text-text-secondary">{t.source_term}</span>
                        <span className="text-text-muted mx-1">→</span>
                        <span className="text-accent">{t.target_term}</span>
                      </span>
                      <button
                        onClick={() => setGlossary((g) => g.filter((_, j) => j !== i))}
                        className="text-text-muted hover:text-danger"
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
