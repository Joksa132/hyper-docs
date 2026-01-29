import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import type { Collaborator } from "@/hooks/use-collaboration";

type PresenceAvatarsProps = {
  collaborators: Collaborator[];
  maxVisible?: number;
};

export function PresenceAvatars({
  collaborators,
  maxVisible = 4,
}: PresenceAvatarsProps) {
  if (collaborators.length === 0) return null;

  const visible = collaborators.slice(0, maxVisible);
  const overflow = collaborators.length - maxVisible;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((collaborator) => (
        <Tooltip key={collaborator.user.id}>
          <TooltipTrigger asChild>
            <div
              className="relative h-8 w-8 rounded-full border-2 border-background flex justify-center items-center text-xs font-medium text-white cursor-default"
              style={{ backgroundColor: collaborator.user.color }}
            >
              {getInitials(collaborator.user.name)}
              {collaborator.isTyping && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{collaborator.user.name}</p>
            {collaborator.isTyping && (
              <p className="text-xs text-muted-foreground">Typing...</p>
            )}
          </TooltipContent>
        </Tooltip>
      ))}

      {overflow > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex justify-center items-center text-xs font-medium cursor-default">
              +{overflow}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              {collaborators.slice(maxVisible).map((c) => (
                <p key={c.user.id}>{c.user.name}</p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
