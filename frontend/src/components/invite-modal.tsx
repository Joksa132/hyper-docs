import { apiFetch } from "@/lib/api";
import type { Member } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "./ui/button";
import { UserPlus, X } from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type InviteModalProps = {
  documentId: string;
  onClose: () => void;
};

export function InviteModal({ documentId, onClose }: InviteModalProps) {
  const queryClient = useQueryClient();

  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");

  const { data: members } = useQuery<Member[]>({
    queryKey: ["document-members", documentId],
    queryFn: () => apiFetch(`/api/documents/${documentId}/members`),
  });

  const invite = useMutation({
    mutationFn: () =>
      apiFetch(`/api/documents/${documentId}/invite`, {
        method: "POST",
        body: JSON.stringify({ email, role }),
      }),
    onSuccess: () => {
      setEmail("");
      queryClient.invalidateQueries({
        queryKey: ["document-members", documentId],
      });
    },
  });

  const remove = useMutation({
    mutationFn: (userId: string) =>
      apiFetch(`/api/documents/${documentId}/members/${userId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["document-members", documentId],
      });
    },
  });

  const updateRole = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "viewer" | "editor";
    }) =>
      apiFetch(`/api/documents/${documentId}/members/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["document-members", documentId],
      });
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Invite people</h2>

      <div className="flex gap-2">
        <Input
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Select
          value={role}
          onValueChange={(v) => setRole(v as "viewer" | "editor")}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => invite.mutate()}
          disabled={!email || invite.isPending}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite
        </Button>
      </div>

      <div className="space-y-2">
        {members?.map((m) => (
          <div
            key={m.userId}
            className="flex items-center justify-between rounded border px-3 py-2 text-sm"
          >
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-muted-foreground">{m.email}</div>
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={m.role}
                disabled={updateRole.isPending}
                onValueChange={(value) =>
                  updateRole.mutate({
                    userId: m.userId,
                    role: value as "viewer" | "editor",
                  })
                }
              >
                <SelectTrigger className="w-[110px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                disabled={remove.isPending}
                onClick={() => remove.mutate(m.userId)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
