import type { Document } from "@/lib/types";
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { FileText, RotateCcw, Star, Trash2, Users } from "lucide-react";
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
      await queryClient.cancelQueries({ queryKey: ["documents"] });
      await queryClient.cancelQueries({ queryKey: ["documents", "starred"] });

      queryClient.setQueryData<Document[]>(["documents"], (old) =>
        old?.map((d) =>
          d.id === doc.id ? { ...d, isStarred: !d.isStarred } : d
        )
      );

      queryClient.setQueryData<Document[]>(["documents", "starred"], (old) =>
        doc.isStarred ? old?.filter((d) => d.id !== doc.id) : old
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documents", "starred"] });
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
    <div className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
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
      <div className="relative aspect-4/3 min-h-[180px] bg-muted/20 p-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-300" />

        <div className="relative bg-white rounded-lg shadow-sm border border-border/50 p-4 h-full">
          <div className="flex flex-col gap-2.5">
            <div className="h-2.5 w-2/3 rounded-full bg-muted/80" />
            <div className="h-2 w-full rounded-full bg-muted/50" />
            <div className="h-2 w-5/6 rounded-full bg-muted/50" />
            <div className="h-2 w-3/4 rounded-full bg-muted/50" />
            <div className="h-2 w-4/6 rounded-full bg-muted/40" />
          </div>
        </div>

        {doc.isStarred && variant === "default" && (
          <div className="absolute left-3 top-3">
            <Star className="h-4 w-4 fill-primary text-primary" />
          </div>
        )}

        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {variant === "default" && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white/90 backdrop-blur-sm shadow-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onStar();
                    }}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        doc.isStarred ? "fill-primary text-primary" : ""
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
                    className="h-8 w-8 bg-white/90 backdrop-blur-sm shadow-sm"
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
                    className="h-8 w-8 bg-white/90 backdrop-blur-sm shadow-sm"
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
                    className="h-8 w-8 shadow-sm"
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

      <div className="border-t border-border px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 shrink-0">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium leading-tight">
              {doc.title || "Untitled document"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {doc.ownerName && (
                <>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {doc.ownerName}
                  </span>
                  <span className="text-muted-foreground/50">·</span>
                </>
              )}
              <span className="text-xs text-muted-foreground">
                {variant === "trash"
                  ? "In trash"
                  : formatRelativeTime(doc.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
