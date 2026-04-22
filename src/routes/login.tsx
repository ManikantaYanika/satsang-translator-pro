import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — Satsang" },
      { name: "description", content: "Sign in to save translations across devices." },
    ],
  }),
});

function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && password !== confirm) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/translate` },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        nav({ to: "/translate" });
      }
    } catch (err: any) {
      toast.error(err.message || "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/translate` },
    });
    if (error) { toast.error(error.message); setLoading(false); }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-[480px] rounded-xl bg-surface border border-border p-6 sm:p-8 shadow-soft">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="font-display font-semibold text-text-primary text-lg">Satsang</span>
        </div>
        <h1 className="font-display text-2xl text-text-primary">
          {mode === "signin" ? "Sign in to save your translations" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {mode === "signin" ? "Access your history and settings across devices." : "Free — no credit card required."}
        </p>

        <button
          onClick={google}
          disabled={loading}
          className="mt-6 w-full h-11 rounded-lg bg-white hover:bg-gray-100 text-gray-900 font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-surface text-xs text-text-muted">or</span>
          </div>
        </div>

        <form onSubmit={submitEmail} className="space-y-3">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-border focus:border-accent outline-none text-sm text-text-primary placeholder:text-text-muted transition-colors"
          />
          <div className="relative">
            <input
              type={showPw ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              minLength={6}
              className="w-full px-3 py-2.5 pr-16 rounded-lg bg-surface-elevated border border-border focus:border-accent outline-none text-sm text-text-primary transition-colors"
            />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-text-primary">{showPw ? "Hide" : "Show"}</button>
          </div>
          {mode === "signup" && (
            <input
              type={showPw ? "text" : "password"} required value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-border focus:border-accent outline-none text-sm text-text-primary transition-colors"
            />
          )}
          <button
            type="submit" disabled={loading}
            className="w-full h-11 rounded-lg bg-accent hover:bg-accent-hover text-accent-foreground font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-text-secondary">
          {mode === "signin" ? (
            <>Don't have an account? <button onClick={() => setMode("signup")} className="text-accent hover:underline">Sign up</button></>
          ) : (
            <>Already have one? <button onClick={() => setMode("signin")} className="text-accent hover:underline">Sign in</button></>
          )}
        </p>

        <div className="mt-5 text-center">
          <Link to="/translate" className="text-xs text-text-muted hover:text-text-secondary">
            Continue without an account →
          </Link>
        </div>
      </div>
    </main>
  );
}
