import { DocumentCard } from "@/components/document-card";
import { LoadingPage } from "@/components/loading-page";
import { apiFetch } from "@/lib/api";
import type { Document } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/trash")({
  component: TrashDocuments,
});

function TrashDocuments() {
  const { data, isLoading } = useQuery<Document[]>({
    queryKey: ["trash"],
    queryFn: () => apiFetch("/api/documents/trash"),
  });

  if (isLoading) {
    return <LoadingPage label="Loading documents from trash" />;
  }

  return (
    <div className="p-6 w-full flex flex-col gap-10">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-5">
        <Trash2 className="h-4 w-4" />
        Trash
      </div>

      {data?.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} variant="trash" />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Trash is empty.</p>
      )}
    </div>
  );
}
