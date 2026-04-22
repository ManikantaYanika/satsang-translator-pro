// Anonymous session id for demo-mode translations
const KEY = "satsang_session_id";
const USED_KEY = "satsang_demo_used";

export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function getDemoUsed(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(USED_KEY) || "0", 10);
}
export function incDemoUsed(): number {
  const n = getDemoUsed() + 1;
  localStorage.setItem(USED_KEY, String(n));
  return n;
}
export const DEMO_LIMIT = 5;
