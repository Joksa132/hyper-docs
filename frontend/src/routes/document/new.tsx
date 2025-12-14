import { DocumentHeader } from "@/components/document-header";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EditorContext, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline_ from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { DocumentToolbar } from "@/components/document-toolbar";
import { DocumentEditor } from "@/components/document-editor";

export const Route = createFileRoute("/document/new")({
  component: NewDocumentPage,
});

function NewDocumentPage() {
  const [title, setTitle] = useState<string>("Untitled Document");

  const editor = useEditor({
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
      TiptapImage.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full",
        },
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      Highlight.configure({
        multicolor: false,
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
    ],
  });

  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <EditorContext.Provider value={providerValue}>
      <div className="flex flex-1 flex-col">
        <DocumentHeader title={title} setTitle={setTitle} />

        <DocumentToolbar />

        <DocumentEditor />
      </div>
    </EditorContext.Provider>
  );
}
