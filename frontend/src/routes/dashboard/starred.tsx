import { DocumentCard } from "@/components/document-card";
import { apiFetch } from "@/lib/api";
import type { Document } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";

export const Route = createFileRoute("/dashboard/starred")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: () => apiFetch("/api/documents"),
  });

  const starredDocs =
    data
      ?.filter((d) => d.isStarred)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)) ?? [];

  if (isLoading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="p-6 w-full flex flex-col gap-10">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-5">
        <Star className="h-4 w-4" />
        Starred
      </div>

      {starredDocs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {starredDocs.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No starred documents yet.
        </p>
      )}
    </div>
  );
}
