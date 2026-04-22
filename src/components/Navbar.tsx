import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const loc = useLocation();
  const { user, signOut } = useAuth();
  const isLanding = loc.pathname === "/";

  const linkCls = (path: string) =>
    `text-sm transition-colors ${
      loc.pathname === path ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
    }`;

  return (
    <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="font-display font-semibold text-text-primary text-lg">Satsang</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/translate" className={linkCls("/translate")}>Translate</Link>
          <Link to="/history" className={linkCls("/history")}>History</Link>
          <Link to="/settings" className={linkCls("/settings")}>Settings</Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:block text-xs text-text-secondary font-mono truncate max-w-[160px]">
                {user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 rounded-lg text-sm border border-border hover:border-border-bright text-text-primary transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-sm border border-accent text-accent hover:bg-accent-muted transition-colors"
            >
              Sign in
            </Link>
          )}
          {isLanding && (
            <Link
              to="/translate"
              className="inline-flex px-3 py-1.5 rounded-lg text-sm bg-accent hover:bg-accent-hover text-accent-foreground font-medium transition-colors"
            >
              Start Translating
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
