import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground">
              <FileText className="h-6 w-6 text-background" />
            </div>
            <span className="text-3xl font-semibold">HyperDocs</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Start collaborating with your team today
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {}}
            >
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {}}
            >
              Continue with GitHub
            </Button>

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {}}
            >
              Continue with 3rd provider
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-muted/30">
        <div className="max-w-md px-8 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground">
            <FileText className="h-8 w-8 text-background" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Write smarter, together
          </h2>
          <p className="mt-3 text-muted-foreground">
            Real-time collaboration and AI-powered writing. Everything you need
            to create great documents.
          </p>
        </div>
      </div>
    </div>
  );
}
