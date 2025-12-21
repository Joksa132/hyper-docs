import { DocumentCard } from "@/components/document-card";
import { LoadingPage } from "@/components/loading-page";
import { apiFetch } from "@/lib/api";
import type { Document } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/dashboard/shared")({
  component: SharedDocuments,
});

function SharedDocuments() {
  const { data, isLoading } = useQuery<Document[]>({
    queryKey: ["documents", "shared"],
    queryFn: () => apiFetch("/api/documents/shared"),
  });

  if (isLoading) {
    return <LoadingPage label="Loading shared documents…" />;
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Users className="h-4 w-4" />
        Shared with me
      </div>

      {data?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No documents have been shared with you yet.
        </p>
      )}
    </div>
  );
}
