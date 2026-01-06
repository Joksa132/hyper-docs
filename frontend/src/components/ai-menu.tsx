import { runDocumentAiCommand, runSelectionAiCommand } from "@/lib/api";
import { aiTextToTiptapNodes, getSelectionText } from "@/lib/helpers";
import type {
  AiAction,
  DocumentAiAction,
  SelectionAiAction,
} from "@/lib/types";
import type { Editor } from "@tiptap/react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Sparkles } from "lucide-react";

export function AiMenu({
  editor,
  documentId,
}: {
  editor: Editor | null;
  documentId: string;
}) {
  const [action, setAction] = useState<AiAction | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  if (!editor) return null;

  const selection = getSelectionText(editor);
  const hasSelection = selection.text.trim().length > 0;

  async function executeSelection(a: SelectionAiAction) {
    if (!hasSelection) return;

    const nextAction: AiAction = {
      scope: "selection",
      action: a,
    };

    setAction(nextAction);
    setError("");
    setOutput("");
    setLoading(true);
    setOpen(true);

    try {
      const res = await runSelectionAiCommand({
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

  async function executeDocument(a: DocumentAiAction) {
    const nextAction: AiAction = {
      scope: "document",
      action: a,
    };

    setAction(nextAction);
    setError("");
    setOutput("");
    setLoading(true);
    setOpen(true);

    try {
      const res = await runDocumentAiCommand({
        action: a,
        documentId,
      });
      setOutput(res.output);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI failed");
    } finally {
      setLoading(false);
    }
  }

  async function regenerate() {
    if (!action) return;

    if (action.scope === "selection") {
      await executeSelection(action.action);
    } else {
      await executeDocument(action.action);
    }
  }

  function apply() {
    if (!output.trim() || !action) return;

    if (action.scope === "selection") {
      const paragraphs = output.split(/\n\s*\n/).map((text) => ({
        type: "paragraph",
        content: [{ type: "text", text }],
      }));

      editor!
        .chain()
        .focus()
        .insertContentAt({ from: selection.from, to: selection.to }, paragraphs)
        .run();
    } else {
      const nodes = aiTextToTiptapNodes(output);

      editor!
        .chain()
        .focus()
        .insertContentAt(0, [...nodes, { type: "paragraph", content: [] }])
        .run();
    }

    setOpen(false);
  }

  const isDocumentAction = action?.scope === "document";

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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!hasSelection}>
              Selection
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-56">
              <DropdownMenuItem onClick={() => executeSelection("rewrite")}>
                Rewrite
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => executeSelection("fix")}>
                Fix grammar & clarity
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => executeSelection("shorten")}>
                Shorten
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => executeSelection("expand")}>
                Expand
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Whole document</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-56">
              <DropdownMenuItem onClick={() => executeDocument("summarize")}>
                Summarize
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isDocumentAction ? "Document Summary" : "AI Result"}
            </DialogTitle>
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
                {isDocumentAction ? "Insert summary" : "Replace selection"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
