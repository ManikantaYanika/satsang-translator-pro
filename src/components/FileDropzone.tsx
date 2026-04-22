import { useState, useRef } from "react";
import mammoth from "mammoth";

type Props = { onText: (text: string, filename: string) => void };

export function FileDropzone({ onText }: Props) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [parsing, setParsing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = async (f: File) => {
    if (f.size > 10 * 1024 * 1024) { setErr("File too large (max 10MB)"); return; }
    setErr(null); setParsing(true); setFile({ name: f.name, size: f.size });
    try {
      const name = f.name.toLowerCase();
      let text = "";
      if (name.endsWith(".txt") || name.endsWith(".rtf")) {
        text = await f.text();
      } else if (name.endsWith(".docx")) {
        const buf = await f.arrayBuffer();
        const r = await mammoth.extractRawText({ arrayBuffer: buf });
        text = r.value;
      } else if (name.endsWith(".pdf")) {
        const pdfjs: any = await import("pdfjs-dist");
        // use bundled worker as blob URL to avoid CORS
        const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
        const buf = await f.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: buf }).promise;
        const parts: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const tc = await page.getTextContent();
          parts.push(tc.items.map((it: any) => it.str).join(" "));
        }
        text = parts.join("\n\n");
      } else {
        setErr("Unsupported file type");
        setParsing(false);
        return;
      }
      onText(text.trim(), f.name);
    } catch (e) {
      console.error(e);
      setErr("Failed to parse document");
    } finally {
      setParsing(false);
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragging(false);
          const f = e.dataTransfer.files[0]; if (f) handle(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          dragging ? "border-accent bg-accent-muted" : "border-border-bright hover:border-accent/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.rtf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
        />
        <div className="text-3xl mb-2">📄</div>
        <div className="text-sm text-text-primary">Drop PDF, DOCX, or TXT file here</div>
        <div className="text-xs text-accent mt-1">or browse files</div>
        <div className="text-xs text-text-muted mt-3">Max 10MB • PDF, DOCX, TXT, RTF supported</div>
      </div>
      {file && (
        <div className="mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-surface-elevated border border-border">
          <div className="min-w-0">
            <div className="text-sm text-text-primary truncate">{file.name}</div>
            <div className="text-xs text-text-muted font-mono">{(file.size / 1024).toFixed(1)} KB {parsing && "• parsing..."}</div>
          </div>
          <button
            onClick={() => { setFile(null); setErr(null); }}
            className="text-text-secondary hover:text-danger text-lg w-6 h-6"
            aria-label="Remove file"
          >×</button>
        </div>
      )}
      {err && <div className="mt-2 text-xs text-danger">{err}</div>}
      {parsing && (
        <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-3 h-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          Extracting text from document...
        </div>
      )}
    </div>
  );
}
