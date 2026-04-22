import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ToneBadge } from "@/components/ToneBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getSessionId } from "@/lib/session";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({
    meta: [
      { title: "History — Satsang" },
      { name: "description", content: "Your translation history, searchable and filterable." },
    ],
  }),
});

const DEMO_ROWS = [
  {
    id: "demo-1",
    source_language: "English", target_language: "Hindi",
    source_text: "Thank you for your consideration.",
    translated_text: "आपके विचार के लिए धन्यवाद।",
    tone_detected: "Formal", domain: "business", confidence_score: 96,
    input_type: "text", is_saved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "demo-2",
    source_language: "English", target_language: "Tamil",
    source_text: "I'm so excited to see you!",
    translated_text: "உன்னைப் பார்க்க எனக்கு மிக உற்சாகமாக இருக்கிறது!",
    tone_detected: "Casual", domain: "casual", confidence_score: 89,
    input_type: "text", is_saved: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "demo-3",
    source_language: "English", target_language: "Bengali",
    source_text: "We're thrilled to announce the launch of our next-generation translation platform, designed to preserve tone and cultural nuance.",
    translated_text: "আমরা আমাদের পরবর্তী প্রজন্মের অনুবাদ প্ল্যাটফর্মের প্রবর্তন ঘোষণা করতে পেরে আনন্দিত।",
    tone_detected: "Professional", domain: "business", confidence_score: 92,
    input_type: "document", is_saved: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

type Filter = "all" | "today" | "week" | "saved" | "documents" | "audio";

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function HistoryPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<"new" | "old" | "lang">("new");

  const load = async () => {
    setLoading(true);
    let q = supabase.from("translations").select("*").order("created_at", { ascending: false }).limit(100);
    if (user) q = q.eq("user_id", user.id);
    else q = q.eq("session_id", getSessionId());
    const { data } = await q;
    const merged = [...(data || []), ...DEMO_ROWS];
    setRows(merged);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const visible = rows
    .filter((r) => {
      if (search && !(`${r.source_text} ${r.translated_text}`.toLowerCase().includes(search.toLowerCase()))) return false;
      const now = Date.now();
      const ts = new Date(r.created_at).getTime();
      if (filter === "today" && now - ts > 24 * 3600 * 1000) return false;
      if (filter === "week" && now - ts > 7 * 24 * 3600 * 1000) return false;
      if (filter === "saved" && !r.is_saved) return false;
      if (filter === "documents" && r.input_type !== "document") return false;
      if (filter === "audio" && r.input_type !== "audio") return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "old") return +new Date(a.created_at) - +new Date(b.created_at);
      if (sort === "lang") return a.target_language.localeCompare(b.target_language);
      return +new Date(b.created_at) - +new Date(a.created_at);
    });

  const del = async (id: string) => {
    if (String(id).startsWith("demo-")) { setRows((r) => r.filter((x) => x.id !== id)); return; }
    await supabase.from("translations").delete().eq("id", id);
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Deleted");
  };

  const toggleSave = async (r: any) => {
    if (String(r.id).startsWith("demo-")) {
      setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, is_saved: !x.is_saved } : x)));
      return;
    }
    const next = !r.is_saved;
    await supabase.from("translations").update({ is_saved: next }).eq("id", r.id);
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, is_saved: next } : x)));
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const filters: { k: Filter; l: string }[] = [
    { k: "all", l: "All" }, { k: "today", l: "Today" }, { k: "week", l: "This Week" },
    { k: "saved", l: "Saved" }, { k: "documents", l: "Documents" }, { k: "audio", l: "Audio" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-5 lg:px-12 py-6 lg:py-10">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-2xl font-display font-semibold text-text-primary">Translation History</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search translations..."
          className="w-full px-4 py-2.5 rounded-lg bg-surface border border-border focus:border-accent outline-none text-sm text-text-primary placeholder:text-text-muted transition-colors"
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  filter === f.k ? "bg-accent text-accent-foreground border-accent" : "bg-surface border-border text-text-secondary hover:border-border-bright"
                }`}
              >{f.l}</button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="ml-auto px-3 py-1.5 rounded-md bg-surface border border-border text-xs text-text-primary outline-none focus:border-accent"
          >
            <option value="new">Newest first</option>
            <option value="old">Oldest first</option>
            <option value="lang">Language A–Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-surface border border-border anim-pulse-soft" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-xl border border-border flex items-center justify-center text-4xl mb-4">📭</div>
          <h2 className="text-lg font-display font-medium text-text-primary">No translations yet</h2>
          <p className="mt-1 text-sm text-text-secondary">Your translations will appear here. Start by translating something.</p>
          <Link to="/translate" className="mt-5 inline-flex px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent-hover transition-colors">
            Translate Now →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visible.map((r) => (
            <article
              key={r.id}
              className={`relative rounded-xl bg-surface border border-border p-5 card-hover ${
                r.is_saved ? "border-l-4 border-l-accent" : ""
              }`}
            >
              <span className="absolute top-3 left-3 w-6 h-6 rounded-md bg-surface-elevated border border-border text-[10px] font-mono text-text-secondary flex items-center justify-center">
                {r.input_type === "document" ? "D" : r.input_type === "audio" ? "A" : "T"}
              </span>
              <div className="flex items-center justify-between text-xs text-text-secondary mb-3 pl-10">
                <span>{r.source_language} → {r.target_language}</span>
                <span>{relativeTime(r.created_at)}</span>
              </div>
              <p className="text-xs text-text-secondary line-clamp-2 mb-1.5">{r.source_text}</p>
              <p className="text-sm text-text-primary line-clamp-2 mb-3">{r.translated_text}</p>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {r.tone_detected && <ToneBadge label={r.tone_detected} kind="tone" />}
                  {r.domain && <ToneBadge label={r.domain} kind="domain" />}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleSave(r)} className="w-7 h-7 rounded-md hover:bg-surface-elevated text-text-secondary hover:text-accent" title="Save">
                    {r.is_saved ? "⭐" : "☆"}
                  </button>
                  <button onClick={() => copy(r.translated_text)} className="w-7 h-7 rounded-md hover:bg-surface-elevated text-text-secondary hover:text-text-primary" title="Copy">📋</button>
                  <button onClick={() => del(r.id)} className="w-7 h-7 rounded-md hover:bg-surface-elevated text-text-secondary hover:text-danger" title="Delete">🗑</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
