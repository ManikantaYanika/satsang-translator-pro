import { useEffect, useRef, useState } from "react";

type Props = { onTranscript: (text: string) => void };

// Uses browser SpeechRecognition for transcription (Chrome/Edge). Falls back to showing upload hint.
export function AudioRecorder({ onTranscript }: Props) {
  const [state, setState] = useState<"idle" | "recording" | "processing">("idle");
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const recRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, []);

  const start = () => {
    setErr(null);
    setTranscript("");
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setErr("Speech recognition not supported in this browser. Try Chrome, or upload an audio file.");
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    let finalText = "";
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setTranscript(finalText + interim);
    };
    rec.onerror = (e: any) => { setErr(e.error || "Recognition error"); stop(); };
    rec.onend = () => { setState("idle"); if (timerRef.current) window.clearInterval(timerRef.current); };
    recRef.current = rec;
    setState("recording");
    setSeconds(0);
    timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000) as unknown as number;
    rec.start();
  };

  const stop = () => {
    try { recRef.current?.stop(); } catch {}
    if (timerRef.current) window.clearInterval(timerRef.current);
    setState("idle");
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <button
        type="button"
        onClick={state === "recording" ? stop : start}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
          state === "recording" ? "bg-danger" : "bg-accent hover:bg-accent-hover"
        }`}
        aria-label={state === "recording" ? "Stop recording" : "Start recording"}
      >
        {state === "recording" ? (
          <div className="w-5 h-5 bg-white rounded-sm" />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="9" y="3" width="6" height="12" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
          </svg>
        )}
      </button>
      <div className="text-sm text-text-secondary">
        {state === "idle" && "Click to start recording"}
        {state === "recording" && (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            Recording... <span className="font-mono text-text-primary">{fmt(seconds)}</span>
          </span>
        )}
      </div>

      {state === "recording" && (
        <div className="flex items-end gap-1 h-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1.5 bg-accent rounded-full anim-eq-bar"
              style={{ height: "100%", animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      )}

      {transcript && (
        <div className="w-full mt-2 p-3 rounded-lg bg-surface-elevated border border-border text-sm text-text-primary anim-fade-in">
          <div className="text-xs text-text-secondary mb-1">Transcript preview</div>
          {transcript}
          {state !== "recording" && (
            <button
              onClick={() => onTranscript(transcript)}
              className="mt-3 w-full py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-foreground text-sm font-medium transition-colors"
            >
              Use this transcript →
            </button>
          )}
        </div>
      )}

      {err && <div className="text-xs text-danger text-center max-w-sm">{err}</div>}
    </div>
  );
}
