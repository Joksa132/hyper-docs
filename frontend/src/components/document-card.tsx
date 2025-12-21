import type { Document } from "@/lib/types";
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { RotateCcw, Star, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/helpers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type DocumentCardProps = {
  doc: Document;
  variant?: "default" | "trash";
};

export function DocumentCard({ doc, variant = "default" }: DocumentCardProps) {
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

  const trashMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/documents/${doc.id}/trash`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["trash"] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/documents/${doc.id}/restore`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["trash"] });
    },
  });

  const deleteForeverMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/documents/${doc.id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trash"] });
    },
  });

  const card = (
    <div className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-lg">
      <CardContent
        doc={doc}
        variant={variant}
        onStar={() => starMutation.mutate()}
        onTrash={() => trashMutation.mutate()}
        onRestore={() => restoreMutation.mutate()}
        onDeleteForever={() => deleteForeverMutation.mutate()}
      />
    </div>
  );

  if (variant === "trash") {
    return card;
  }

  return (
    <Link to="/document/$id" params={{ id: doc.id }}>
      {card}
    </Link>
  );
}

function CardContent({
  doc,
  variant,
  onStar,
  onTrash,
  onRestore,
  onDeleteForever,
}: {
  doc: Document;
  variant: "default" | "trash";
  onStar: () => void;
  onTrash: () => void;
  onRestore: () => void;
  onDeleteForever: () => void;
}) {
  return (
    <>
      <div className="relative aspect-4/3 min-h-[220px] bg-muted/30 p-4">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-3/4 rounded bg-muted" />
          <div className="h-2 w-full rounded bg-muted" />
          <div className="h-2 w-5/6 rounded bg-muted" />
          <div className="h-2 w-4/6 rounded bg-muted" />
        </div>

        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {variant === "default" && !doc.isOwner && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onStar();
                    }}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        doc.isStarred && "fill-primary text-primary"
                      }`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {doc.isStarred ? "Unstar" : "Star"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onTrash();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Move to trash</TooltipContent>
              </Tooltip>
            </>
          )}

          {variant === "trash" && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRestore();
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restore from trash</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (
                        confirm(
                          "This will permanently delete the document. This action cannot be undone."
                        )
                      ) {
                        onDeleteForever();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete forever</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-border px-5 py-4">
        <p className="truncate font-medium text-lg">
          {doc.title || "Untitled document"}
        </p>
        {doc.ownerName && (
          <p className="text-xs text-muted-foreground mt-1">
            Shared by {doc.ownerName}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {variant === "trash"
            ? "In trash"
            : `Edited ${formatRelativeTime(doc.updatedAt)}`}
        </p>
      </div>
    </>
  );
}
