import type { Collaborator } from "@/hooks/use-collaboration";

type TypingIndicatorProps = {
  collaborators: Collaborator[];
};

export function TypingIndicator({ collaborators }: TypingIndicatorProps) {
  const typingUsers = collaborators.filter((c) => c.isTyping);

  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.user.name.split(" ")[0]);

  let text: string;
  if (names.length === 1) {
    text = `${names[0]} is typing`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing`;
  } else {
    text = `${names[0]} and ${names.length - 1} others are typing`;
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="flex gap-0.5">
        <span
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span>{text}</span>
    </div>
  );
}
