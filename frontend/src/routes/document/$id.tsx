import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
import { DocumentHeader } from "@/components/document-header";
import { DocumentToolbar } from "@/components/document-toolbar";
import { DocumentEditor } from "@/components/document-editor";
import { useEffect, useMemo } from "react";
import type { Document } from "@/lib/types";

export const Route = createFileRoute("/document/$id")({
  component: DocumentPage,
});

function DocumentPage() {
  const { id } = Route.useParams();

  const getDocument = async (id: string) => {
    return apiFetch<Document>(`/api/documents/${id}`);
  };

  const { data: doc } = useQuery<Document>({
    queryKey: ["document", id],
    queryFn: () => getDocument(id),
  });

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
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && doc) {
      editor.commands.setContent(doc.content);
    }
  }, [editor, doc]);

  const providerValue = useMemo(() => ({ editor }), [editor]);

  if (!doc || !editor) return null;

  return (
    <EditorContext.Provider value={providerValue}>
      <div className="flex flex-1 flex-col">
        <DocumentHeader key={id} documentId={id} />

        <DocumentToolbar />

        <DocumentEditor />
      </div>
    </EditorContext.Provider>
  );
}
