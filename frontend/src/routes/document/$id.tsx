import { apiFetch } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { EditorContext, useEditor, type JSONContent } from "@tiptap/react";
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
import { useEffect, useMemo, useState } from "react";
import type { Document } from "@/lib/types";
import { useDebounce } from "@uidotdev/usehooks";

export const Route = createFileRoute("/document/$id")({
  component: DocumentPage,
});

function DocumentPage() {
  const { id } = Route.useParams();

  const [content, setContent] = useState<JSONContent | null>(null);

  const debouncedContent = useDebounce(content, 3000);

  const queryClient = useQueryClient();

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
    onUpdate({ editor }) {
      setContent(editor.getJSON());
    },
  });

  useEffect(() => {
    if (editor && doc && !editor.isEmpty) return;
    if (editor && doc) {
      editor.commands.setContent(doc.content);
    }
  }, [editor, doc]);

  const providerValue = useMemo(() => ({ editor }), [editor]);

  const saveContent = async (content: JSONContent) => {
    return apiFetch(`/api/documents/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    });
  };

  const saveMutation = useMutation({
    mutationFn: saveContent,
    onMutate: async () => {
      queryClient.setQueryData(["save-status", id], "saving");
    },
    onSuccess: () => {
      queryClient.setQueryData(["save-status", id], "saved");
    },
  });

  useEffect(() => {
    if (!debouncedContent) return;
    if (!doc) return;

    saveMutation.mutate(debouncedContent);
  }, [debouncedContent]);

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
