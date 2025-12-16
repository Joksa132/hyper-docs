import { apiFetch } from "@/lib/api";
import type { Document } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isLoading } = useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: () => apiFetch("/api/documents"),
  });

  if (isLoading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="p-6 w-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data?.map((doc) => (
        <Link
          key={doc.id}
          to="/document/$id"
          params={{ id: doc.id }}
          className="rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex flex-col gap-1">
            <div className="truncate font-medium text-sm">
              {doc.title || "Untitled document"}
            </div>
            <div className="text-xs text-muted-foreground">
              Last edited {new Date(doc.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </Link>
      ))}

      {data?.length === 0 && (
        <p className="text-sm text-muted-foreground">No documents yet.</p>
      )}
    </div>
  );
}
