import { DocumentCard } from "@/components/document-card";
import { apiFetch } from "@/lib/api";
import type { Document } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

export const Route = createFileRoute("/dashboard/search")({
  validateSearch: (search: { query?: string }) => search,
  component: SearchPage,
});

function SearchPage() {
  const { query } = Route.useSearch();

  const { data, isLoading } = useQuery<Document[]>({
    queryKey: ["documents", "search", query],
    queryFn: () =>
      apiFetch(`/api/documents?search=${encodeURIComponent(query ?? "")}`),
    enabled: Boolean(query),
  });

  if (!query) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Start typing to search documents.
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-6">Searching…</div>;
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Search className="h-4 w-4" />
        Results for “{query}”
      </div>

      {data?.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No documents match your search.
        </p>
      )}
    </div>
  );
}
