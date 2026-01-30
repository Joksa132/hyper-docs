import { DocumentCard } from "@/components/document-card";
import { LoadingPage } from "@/components/loading-page";
import { apiFetch } from "@/lib/api";
import type { Document } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { Clock, FileText, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useRouteContext({ from: "/dashboard" });

  const { data, isLoading } = useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: () => apiFetch("/api/documents"),
  });

  const sortedDocuments = data
    ?.slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

  const recentDocuments = sortedDocuments?.slice(0, 6);

  if (isLoading) {
    return <LoadingPage label="Loading documents..." />;
  }

  const firstName = user.name.split(" ")[0];

  return (
    <div>
      <div className="px-8 py-10 bg-linear-to-br from-primary/15 via-primary/5 to-transparent">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground mt-2">
          Pick up where you left off or start something new.
        </p>
      </div>

      <div className="px-8 py-8 flex flex-col gap-10">
        {recentDocuments && recentDocuments.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex justify-center items-center h-8 w-8 rounded-lg bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Recent documents</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentDocuments.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex justify-center items-center h-8 w-8 rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">All documents</h2>
            {sortedDocuments && sortedDocuments.length > 0 && (
              <span className="text-sm text-muted-foreground">
                ({sortedDocuments.length})
              </span>
            )}
          </div>

          {sortedDocuments && sortedDocuments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {sortedDocuments.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center py-16 px-4 rounded-xl border border-dashed border-border bg-muted/20">
              <div className="flex justify-center items-center h-14 w-14 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-1">No documents yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Create your first document to get started. Click the "New
                document" button in the sidebar.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
