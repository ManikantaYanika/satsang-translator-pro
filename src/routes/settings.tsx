import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ToneSlider } from "@/components/ToneSlider";
import { Toggle } from "@/components/Toggle";
import { DOMAINS } from "@/lib/languages";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — Satsang" },
      { name: "description", content: "Configure translation defaults, AI providers, and appearance." },
    ],
  }),
});

const SECTIONS = [
  { k: "prefs", l: "Default Preferences" },
  { k: "ai", l: "AI & Translation" },
  { k: "audio", l: "Audio" },
  { k: "appearance", l: "Appearance" },
  { k: "account", l: "Account" },
];

function SettingsPage() {
  const { user } = useAuth();
  const [active, setActive] = useState("prefs");
  const [showKey, setShowKey] = useState(false);

  const [src, setSrc] = useState("en");
  const [tgt, setTgt] = useState("hi");
  const [formality, setFormality] = useState(50);
  const [domain, setDomain] = useState("general");
  const [autoDetect, setAutoDetect] = useState(true);
  const [provider, setProvider] = useState("lovable");
  const [apiKey, setApiKey] = useState("");
  const [maxTokens, setMaxTokens] = useState(2000);
  const [stt, setStt] = useState("browser");
  const [autoPunctuate, setAutoPunctuate] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState("medium");
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setSrc(data.default_source_lang ?? "en");
      setTgt(data.default_target_lang ?? "hi");
      setFormality(data.default_formality ?? 50);
      setDomain(data.default_domain ?? "general");
      setProvider(data.llm_provider ?? "lovable");
      setTheme(data.theme ?? "dark");
      setFontSize(data.font_size ?? "medium");
    });
  }, [user]);

  const save = async () => {
    if (!user) { toast.error("Sign in to save settings"); return; }
    const { error } = await supabase.from("user_settings").upsert({
      user_id: user.id,
      default_source_lang: src,
      default_target_lang: tgt,
      default_formality: formality,
      default_domain: domain,
      llm_provider: provider,
      theme,
      font_size: fontSize,
      updated_at: new Date().toISOString(),
    });
    if (error) toast.error(error.message);
    else toast.success("Settings saved");
  };

  return (
    <main className="max-w-7xl mx-auto px-5 lg:px-12 py-6 lg:py-10">
      <h1 className="text-2xl font-display font-semibold text-text-primary mb-6">Settings</h1>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {SECTIONS.map((s) => (
            <button
              key={s.k}
              onClick={() => setActive(s.k)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                active === s.k ? "bg-accent-muted text-accent" : "text-text-secondary hover:text-text-primary hover:bg-surface"
              }`}
            >{s.l}</button>
          ))}
        </nav>

        <div className="rounded-xl bg-surface border border-border p-6 space-y-6">
          {active === "prefs" && (
            <>
              <Section title="Default Preferences">
                <Row label="Default source language"><LanguageSelector value={src} onChange={setSrc} /></Row>
                <Row label="Default target language"><LanguageSelector value={tgt} onChange={setTgt} excludeAuto /></Row>
                <Row label="Default formality">
                  <ToneSlider value={formality} onChange={setFormality} leftLabel="Casual" rightLabel="Formal" valueLabel={`${formality}`} />
                </Row>
                <Row label="Default domain">
                  <select value={domain} onChange={(e) => setDomain(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-text-primary outline-none focus:border-accent">
                    {DOMAINS.map((d) => <option key={d.value} value={d.value}>{d.icon} {d.label}</option>)}
                  </select>
                </Row>
                <Toggle checked={autoDetect} onChange={setAutoDetect} label="Auto-detect language" description="Automatically detect source language on paste" />
              </Section>
            </>
          )}

          {active === "ai" && (
            <Section title="AI & Translation">
              <div>
                <div className="text-sm text-text-primary mb-2">LLM Provider</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: "lovable", l: "Lovable AI (built-in)" },
                    { v: "openai", l: "OpenAI GPT-4o" },
                    { v: "anthropic", l: "Anthropic Claude" },
                    { v: "gemini", l: "Google Gemini" },
                    { v: "deepl", l: "DeepL" },
                  ].map((p) => (
                    <button
                      key={p.v}
                      onClick={() => setProvider(p.v)}
                      className={`px-3 py-2.5 rounded-lg text-sm border text-left transition-colors ${
                        provider === p.v ? "bg-accent-muted border-accent text-accent" : "bg-surface-elevated border-border text-text-primary hover:border-border-bright"
                      }`}
                    >{p.l}</button>
                  ))}
                </div>
              </div>
              {provider !== "lovable" && (
                <Row label="API Key">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full px-3 py-2 pr-16 rounded-lg bg-surface-elevated border border-border text-sm text-text-primary outline-none focus:border-accent font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-text-primary"
                      >{showKey ? "Hide" : "Show"}</button>
                    </div>
                    <button className="px-3 py-2 rounded-lg border border-border text-sm text-text-primary hover:border-border-bright">Test</button>
                  </div>
                </Row>
              )}
              <Row label="Max tokens per request">
                <input
                  type="number"
                  min={100} max={8000} value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value || "2000", 10))}
                  className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-text-primary font-mono outline-none focus:border-accent"
                />
              </Row>
            </Section>
          )}

          {active === "audio" && (
            <Section title="Audio">
              <Row label="Speech-to-text provider">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: "browser", l: "Browser Native" },
                    { v: "whisper", l: "OpenAI Whisper" },
                    { v: "deepgram", l: "Deepgram" },
                  ].map((p) => (
                    <button key={p.v} onClick={() => setStt(p.v)} className={`px-3 py-2 rounded-lg text-xs border transition-colors ${stt === p.v ? "bg-accent-muted border-accent text-accent" : "bg-surface-elevated border-border text-text-primary"}`}>{p.l}</button>
                  ))}
                </div>
              </Row>
              <Toggle checked={autoPunctuate} onChange={setAutoPunctuate} label="Auto-punctuate transcriptions" />
            </Section>
          )}

          {active === "appearance" && (
            <Section title="Appearance">
              <Row label="Theme">
                <div className="grid grid-cols-3 gap-2">
                  {["dark", "light", "system"].map((t) => (
                    <button key={t} onClick={() => setTheme(t)} className={`px-3 py-2 rounded-lg text-xs border capitalize transition-colors ${theme === t ? "bg-accent-muted border-accent text-accent" : "bg-surface-elevated border-border text-text-primary"}`}>{t}</button>
                  ))}
                </div>
              </Row>
              <Row label="Font size">
                <div className="grid grid-cols-3 gap-2">
                  {["small", "medium", "large"].map((t) => (
                    <button key={t} onClick={() => setFontSize(t)} className={`px-3 py-2 rounded-lg text-xs border capitalize transition-colors ${fontSize === t ? "bg-accent-muted border-accent text-accent" : "bg-surface-elevated border-border text-text-primary"}`}>{t}</button>
                  ))}
                </div>
              </Row>
              <Toggle checked={compact} onChange={setCompact} label="Compact mode" description="Reduces padding for power users" />
            </Section>
          )}

          {active === "account" && (
            <Section title="Account">
              {user ? (
                <>
                  <Row label="Email"><div className="text-sm text-text-primary font-mono">{user.email}</div></Row>
                  <Row label="Usage this month"><div className="text-sm text-text-primary font-mono">— translations</div></Row>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 rounded-lg border border-border text-sm hover:border-border-bright">Export all history (CSV)</button>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="text-sm font-medium text-danger mb-2">Danger zone</div>
                    <button className="px-3 py-2 rounded-lg border border-danger text-danger text-sm hover:bg-danger hover:text-white transition-colors">Delete all history</button>
                  </div>
                </>
              ) : (
                <div className="text-sm text-text-secondary">
                  <a href="/login" className="text-accent hover:underline">Sign in</a> to manage your account.
                </div>
              )}
            </Section>
          )}

          <div className="pt-4 border-t border-border flex justify-end">
            <button onClick={save} className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-foreground font-medium transition-colors">
              Save changes
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg text-text-primary mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-text-secondary mb-1.5">{label}</div>
      {children}
    </div>
  );
}
