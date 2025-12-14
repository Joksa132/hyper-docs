import { Link } from "@tanstack/react-router";
import {
  Clock,
  FileText,
  MessageSquare,
  Share2,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

type DocumentHeaderProps = {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
};

export function DocumentHeader({ title, setTitle }: DocumentHeaderProps) {
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
          className="h-8 w-64 border-none bg-transparent text-sm font-medium shadow-none px-2 hover:ring-1 hover:ring-input"
        />
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
