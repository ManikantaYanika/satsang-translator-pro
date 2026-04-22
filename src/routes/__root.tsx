import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { Navbar } from "@/components/Navbar";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Satsang — Context-Aware Translator" },
      {
        name: "description",
        content:
          "The first AI translator that preserves tone, intent, and cultural voice — not just words. Built for professionals, writers, and global teams.",
      },
      { property: "og:title", content: "Satsang — Context-Aware Translator" },
      {
        property: "og:description",
        content: "Style-aware AI translation with tone preservation, document upload, and audio input.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          },
        }}
      />
    </>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display font-bold text-text-primary">404</h1>
        <p className="mt-4 text-text-secondary">The page you're looking for doesn't exist.</p>
        <a href="/" className="mt-6 inline-flex px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent-hover transition-colors">
          Go home
        </a>
      </div>
    </div>
  );
}
