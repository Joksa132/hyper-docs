import { Link } from "@tanstack/react-router";
import {
  Check,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Share2,
  Sparkles,
  Star,
  UserPlus,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Document, SaveStatus } from "@/lib/types";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Dialog, DialogContent } from "./ui/dialog";
import { ShareModal } from "./share-modal";

type DocumentHeaderProps = {
  documentId: string;
};

export function DocumentHeader({ documentId }: DocumentHeaderProps) {
  const queryClient = useQueryClient();

  const doc = queryClient.getQueryData<Document>(["document", documentId]);

  const [title, setTitle] = useState(() => doc?.title ?? "");

  const debouncedTitle = useDebounce(title, 1000);

  const [shareOpen, setShareOpen] = useState(false);

  const updateDocument = async (data: { title?: string }) => {
    return apiFetch<Document>(`/api/documents/${documentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  };

  const { mutate } = useMutation({
    mutationFn: updateDocument,
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["document", documentId] });

      queryClient.setQueryData<Document>(["document", documentId], (old) =>
        old ? { ...old, ...data } : old
      );
    },
  });

  useEffect(() => {
    if (!doc) return;
    if (debouncedTitle === doc.title) return;

    mutate({ title: debouncedTitle });
  }, [debouncedTitle]);

  const status =
    queryClient.getQueryData<SaveStatus>(["save-status", documentId]) ?? "idle";

  const toggleStar = async () => {
    return apiFetch(`/api/documents/${documentId}/star`, {
      method: doc?.isStarred ? "DELETE" : "POST",
    });
  };

  const starMutation = useMutation({
    mutationFn: toggleStar,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["document", documentId] });

      queryClient.setQueryData<Document>(["document", documentId], (old) =>
        old ? { ...old, isStarred: !old.isStarred } : old
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  return (
    <TooltipProvider>
      <header className="h-14 flex justify-between items-center border-b border-border px-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <div className="h-8 w-8 flex justify-center items-center rounded bg-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
          </Link>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 w-40 border-none bg-transparent text-sm font-medium"
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => starMutation.mutate()}
                className="group hover:bg-primary hover:text-primary-foreground"
              >
                <Star
                  className={`h-4 w-4 ${
                    doc?.isStarred
                      ? "fill-primary text-primary group-hover:fill-primary-foreground group-hover:text-primary-foreground"
                      : "group-hover:text-primary-foreground"
                  }`}
                />
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              {doc?.isStarred ? "Unstar document" : "Star document"}
            </TooltipContent>
          </Tooltip>

          {status === "saving" && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </span>
          )}

          {status === "saved" && (
            <span className="text-xs text-primary flex items-center gap-1">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div>Presence avatars</div>

          <div className="h-6 w-px mx-1 shrink-0 bg-border" />

          <Button variant="ghost" size="sm" className="bg-muted">
            <MessageSquare className="mr-2 h-4 w-4" />
            Comments
          </Button>

          <Button variant="ghost" size="sm" className="bg-muted">
            <Clock className="mr-2 h-4 w-4" />
            History
          </Button>

          <Button variant="ghost" size="sm" className="bg-muted">
            <Sparkles className="mr-2 h-4 w-4" />
            AI
          </Button>

          <div className="h-6 w-px mx-1 shrink-0 bg-border" />

          <Button variant="outline" size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite
          </Button>

          <Button size="sm" onClick={() => setShareOpen(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </header>

      {shareOpen && (
        <Dialog open onOpenChange={setShareOpen}>
          <DialogContent>
            <ShareModal
              documentId={documentId}
              documentName={title}
              isPublic={doc?.isPublic}
              publicToken={doc?.publicToken}
              onClose={() => setShareOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </TooltipProvider>
  );
}
