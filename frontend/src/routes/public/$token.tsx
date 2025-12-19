import { LoadingPage } from "@/components/loading-page";
import { apiFetch } from "@/lib/api";
import type { Document } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline_ from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { useEffect } from "react";

export const Route = createFileRoute("/public/$token")({
  component: PublicDocumentPage,
});

function PublicDocumentPage() {
  const { token } = Route.useParams();

  const { data, isLoading } = useQuery<Document>({
    queryKey: ["public-doc", token],
    queryFn: () => apiFetch(`/api/public/${token}`),
  });

  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline_,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TiptapImage,
      TiptapLink.configure({
        openOnClick: true,
        enableClickSelection: true,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
    ],
  });

  useEffect(() => {
    if (!editor || !data) return;

    editor.commands.setContent(data.content);
  }, [editor, data]);

  if (isLoading) {
    return <LoadingPage label="Loading document…" />;
  }

  if (!data) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Document not found or no longer shared.
      </div>
    );
  }

  if (!editor) return null;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center py-2">
      <h1 className="mb-4 text-2xl font-semibold">{data.title}</h1>
      <div className="bg-white w-full max-w-[850px] shadow-md rounded-sm">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
