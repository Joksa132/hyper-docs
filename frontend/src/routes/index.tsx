import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto px-6 flex items-center justify-between h-16 max-w-6xl">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <FileText className="h-4 w-4 text-background" />
            </div>
            <span className="text-lg font-semibold">HyperDocs</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative px-6 pt-32 pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 px-4 py-1 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 text-sm font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>AI-powered writing assistant</span>
          </div>
          <h1 className="text-balance text-7xl font-semibold">
            Write together,
            <br />
            <span className="text-muted-foreground">in real-time</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            A modern document editor. Collaborate with live cursors, AI-assisted
            writing, and more random text later.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="flex items-center gap-2">
                Start writing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
