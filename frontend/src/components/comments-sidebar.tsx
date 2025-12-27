import { apiFetch } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import type { Comment } from "@/lib/types";
import { MessageSquare, Send, X } from "lucide-react";
import { formatRelativeTime } from "@/lib/helpers";

export function CommentsSidebar({
  documentId,
  canComment,
  currentUserId,
  onClose,
}: {
  documentId: string;
  canComment: boolean;
  currentUserId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState<string>("");

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ["comments", documentId],
    queryFn: () => apiFetch(`/api/documents/${documentId}/comments`),
  });

  const addComment = useMutation({
    mutationFn: () =>
      apiFetch(`/api/documents/${documentId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", documentId] });
    },
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: string) =>
      apiFetch(`/api/documents/${documentId}/comments/${commentId}`, {
        method: "DELETE",
      }),

    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments", documentId] });

      const previous = queryClient.getQueryData<Comment[]>([
        "comments",
        documentId,
      ]);

      queryClient.setQueryData<Comment[]>(["comments", documentId], (old) =>
        old?.filter((c) => c.id !== commentId)
      );

      return { previous };
    },
  });

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <aside className="fixed right-0 top-0 z-50 h-dvh w-[380px] border-l border-border bg-background shadow-2xl flex flex-col">
        <div className="h-14 border-b border-border px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex justify-center items-center">
              <MessageSquare className="h-4 w-4 text-secondary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Comments</span>
              <span className="text-xs text-muted-foreground">
                {isLoading ? "Loading…" : `${comments?.length} total`}
              </span>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {isLoading && (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="h-3 w-24 rounded bg-muted mb-2" />
                <div className="h-2 w-full rounded bg-muted mb-1" />
                <div className="h-2 w-5/6 rounded bg-muted" />
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="h-3 w-20 rounded bg-muted mb-2" />
                <div className="h-2 w-full rounded bg-muted mb-1" />
                <div className="h-2 w-4/6 rounded bg-muted" />
              </div>
            </div>
          )}

          {!isLoading && comments?.length === 0 && (
            <div className="h-full flex justify-center flex-col items-center text-center px-6">
              <div className="h-10 w-10 rounded-xl bg-muted flex justify-center items-center mb-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                {canComment
                  ? "Be the first to add a comment on this document."
                  : "Only editors can add comments."}
              </p>
            </div>
          )}

          {!isLoading &&
            comments?.map((c) => (
              <div
                key={c.id}
                className="group relative rounded-xl border border-border bg-card p-3"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {c.authorName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(c.createdAt)}
                    </p>
                  </div>
                </div>

                {c.authorId === currentUserId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => deleteComment.mutate(c.id)}
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                )}

                <p className="mt-2 text-sm text-foreground whitespace-pre-wrap wrap-break-word">
                  {c.content}
                </p>
              </div>
            ))}
        </div>

        <div className="border-t border-border bg-background p-4">
          {canComment ? (
            <div className="flex flex-col gap-2">
              <Textarea
                placeholder="Add a comment…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[92px] resize-none"
              />

              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {addComment.isPending
                    ? "Posting…"
                    : "Shift+Enter for newline"}
                </p>

                <Button
                  onClick={() => addComment.mutate()}
                  disabled={!content.trim() || addComment.isPending}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Comment
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              You don’t have permission to comment on this document.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
