import { DocumentCard } from "@/components/document-card";
import { LoadingPage } from "@/components/loading-page";
import { apiFetch } from "@/lib/api";
import type { Document } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, FileText } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isLoading } = useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: () => apiFetch("/api/documents"),
  });

  const sortedDocuments = data
    ?.slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  const recentDocuments = sortedDocuments?.slice(0, 8);

  if (isLoading) {
    return <LoadingPage label="Loading documents..." />;
  }

  return (
    <div className="p-6 w-full flex flex-col gap-10">
      <section>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-5">
          <Clock className="h-4 w-4" />
          Recent documents
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentDocuments?.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}

          {recentDocuments?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No recent documents.
            </p>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-5">
          <FileText className="h-4 w-4" />
          All documents
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedDocuments?.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}

          {sortedDocuments?.length === 0 && (
            <p className="text-sm text-muted-foreground">No documents yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
