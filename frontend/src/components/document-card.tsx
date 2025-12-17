import type { Document } from "@/lib/types";
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { Star, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/helpers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export function DocumentCard({ doc }: { doc: Document }) {
  const queryClient = useQueryClient();

  const starMutation = useMutation({
    mutationFn: async () => {
      return apiFetch(`/api/documents/${doc.id}/star`, {
        method: doc.isStarred ? "DELETE" : "POST",
      });
    },
    onMutate: async () => {
      queryClient.setQueryData<Document[]>(["documents"], (old) =>
        old?.map((d) =>
          d.id === doc.id ? { ...d, isStarred: !d.isStarred } : d
        )
      );
    },
  });

  return (
    <Link
      key={doc.id}
      to="/document/$id"
      params={{ id: doc.id }}
      className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-lg"
    >
      <div className="relative aspect-4/3 min-h-[220px] bg-muted/30 p-4">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-3/4 rounded bg-muted" />
          <div className="h-2 w-full rounded bg-muted" />
          <div className="h-2 w-5/6 rounded bg-muted" />
          <div className="h-2 w-4/6 rounded bg-muted" />
        </div>

        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault();
              starMutation.mutate();
            }}
          >
            <Star
              className={`h-4 w-4 ${
                doc.isStarred && "fill-primary text-primary"
              }`}
            />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border-t border-border px-5 py-4">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-lg">
              {doc.title || "Untitled document"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Edited {formatRelativeTime(doc.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
