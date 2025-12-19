import { apiFetch } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Globe, Link2, Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type ShareModalProps = {
  documentId: string;
  documentName: string;
  isPublic?: boolean;
  publicToken?: string | null;
  onClose: () => void;
};

export function ShareModal({
  documentId,
  documentName,
  isPublic,
  publicToken,
  onClose,
}: ShareModalProps) {
  const queryClient = useQueryClient();

  const shareMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ token: string }>(`/api/documents/${documentId}/share`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
    },
  });

  const unshareMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/documents/${documentId}/unshare`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
    },
  });

  const link = publicToken && `${window.location.origin}/public/${publicToken}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold leading-none">
          Share “{documentName}”
        </h2>
        <p className="text-sm text-muted-foreground">
          Control how others can access this document
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          {isPublic ? (
            <Globe className="h-4 w-4 text-primary" />
          ) : (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {isPublic ? "Public access enabled" : "Restricted access"}
            </span>
            <span className="text-xs text-muted-foreground">
              {isPublic
                ? "Anyone with the link can view"
                : "Only you can access this document"}
            </span>
          </div>
        </div>

        {isPublic && link ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Input readOnly value={link} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigator.clipboard.writeText(link)}
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy link</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                View-only, no sign-in required
              </span>

              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => unshareMutation.mutate()}
              >
                Disable link
              </Button>
            </div>
          </div>
        ) : (
          <Button className="w-full" onClick={() => shareMutation.mutate()}>
            Enable public link
          </Button>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
