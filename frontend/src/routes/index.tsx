import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ArrowRight,
  FileText,
  Sparkles,
  Users,
  Zap,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HyperDocs - Collaborative Document Editor" },
      {
        name: "description",
        content:
          "Create, edit, and collaborate on documents in real-time with AI-powered writing assistance.",
      },
    ],
  }),
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto px-6 flex items-center justify-between h-16 max-w-6xl">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
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

      <section className="relative px-6 pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="mx-auto max-w-4xl text-center relative">
          <div className="mb-6 px-4 py-1 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>AI-powered writing assistant</span>
          </div>
          <h1 className="text-balance text-4xl sm:text-5xl md:text-7xl font-semibold">
            Write together,
            <br />
            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              in real-time
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            A modern document editor. Collaborate with live cursors, AI-assisted
            writing, and seamless sharing.
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

      <section className="px-6 py-20 bg-primary/5">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-border/50">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Work together with your team in real-time. See changes instantly as they happen.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-border/50">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-powered writing</h3>
              <p className="text-sm text-muted-foreground">
                Get intelligent suggestions and let AI help you write better, faster.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-border/50">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure sharing</h3>
              <p className="text-sm text-muted-foreground">
                Control who can view and edit your documents with granular permissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold mb-3">How it works</h2>
            <p className="text-muted-foreground">Get started in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-semibold mb-4">
                1
              </div>
              <h3 className="font-medium mb-2">Create an account</h3>
              <p className="text-sm text-muted-foreground">
                Sign up for free and set up your workspace.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-semibold mb-4">
                2
              </div>
              <h3 className="font-medium mb-2">Start a document</h3>
              <p className="text-sm text-muted-foreground">
                Create a new document and begin writing.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-semibold mb-4">
                3
              </div>
              <h3 className="font-medium mb-2">Invite your team</h3>
              <p className="text-sm text-muted-foreground">
                Share with collaborators and work together.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-primary">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold mb-4 text-primary-foreground">Ready to get started?</h2>
          <p className="text-primary-foreground/80 mb-8">
            Join teams who are already writing smarter with HyperDocs.
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="gap-2">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
