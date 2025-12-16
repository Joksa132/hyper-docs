import { Link } from "@tanstack/react-router";
import {
  Clock,
  FileText,
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
import type { Document } from "@/lib/types";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";

type DocumentHeaderProps = {
  documentId: string;
};

export function DocumentHeader({ documentId }: DocumentHeaderProps) {
  const queryClient = useQueryClient();

  const doc = queryClient.getQueryData<Document>(["document", documentId]);

  const [title, setTitle] = useState(() => doc?.title ?? "");

  const debouncedTitle = useDebounce(title, 1000);

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

  return (
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

        <Button variant="ghost" size="sm">
          <Star className="h-4 w-4" />
        </Button>
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

        <Button size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </header>
  );
}
