import { runAiCommand } from "@/lib/api";
import { getSelectionText } from "@/lib/helpers";
import type { AiAction } from "@/lib/types";
import type { Editor } from "@tiptap/react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Sparkles } from "lucide-react";

export function AiMenu({ editor }: { editor: Editor | null }) {
  const [action, setAction] = useState<AiAction | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  if (!editor) return null;

  const selection = getSelectionText(editor);
  const hasSelection = selection.text.trim().length > 0;

  async function execute(a: AiAction) {
    if (!hasSelection) return;

    setAction(a);
    setError("");
    setOutput("");
    setLoading(true);
    setOpen(true);

    try {
      const res = await runAiCommand({
        action: a,
        selectionText: selection.text,
      });

      setOutput(res.output);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("AI failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function regenerate() {
    if (!action || !hasSelection) return;
    await execute(action);
  }

  function apply() {
    if (!output.trim()) return;

    const paragraphs = output.split(/\n\s*\n/).map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    }));

    editor!
      .chain()
      .focus()
      .insertContentAt({ from: selection.from, to: selection.to }, paragraphs)
      .run();

    setOpen(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Sparkles className="mr-2 h-4 w-4" />
            AI
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            disabled={!hasSelection}
            onClick={() => execute("rewrite")}
          >
            Rewrite selection
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!hasSelection}
            onClick={() => execute("fix")}
          >
            Fix grammar & clarity
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!hasSelection}
            onClick={() => execute("shorten")}
          >
            Shorten
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!hasSelection}
            onClick={() => execute("expand")}
          >
            Expand
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>AI Result</DialogTitle>
          </DialogHeader>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex-1 overflow-y-auto">
            <Textarea
              className="min-h-[200px] resize-none"
              value={output}
              readOnly
              placeholder={loading ? "Generating…" : ""}
            />
          </div>

          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              disabled={loading || !action}
              onClick={regenerate}
            >
              Regenerate
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!output.trim()} onClick={apply}>
                Replace selection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
