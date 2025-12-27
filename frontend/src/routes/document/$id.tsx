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
import { CommentsSidebar } from "@/components/comments-sidebar";

export const Route = createFileRoute("/document/$id")({
  component: DocumentPage,
});

function DocumentPage() {
  const { id } = Route.useParams();

  const [content, setContent] = useState<JSONContent | null>(null);
  const [commentsOpen, setCommentsOpen] = useState<boolean>(false);

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
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
        enableClickSelection: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        isAllowedUri: (url, ctx) => {
          if (!ctx.defaultValidate(url)) return false;

          if (url.startsWith("javascript:")) return false;
          if (url.startsWith("./") || url.startsWith("/")) return false;

          return true;
        },
        shouldAutoLink: (url) => {
          return url.startsWith("https://") || url.startsWith("http://");
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
    immediatelyRender: false,
    onUpdate({ editor }) {
      if (doc?.role !== "editor") return;
      setContent(editor.getJSON());
    },
    editable: doc?.role === "editor",
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
    if (doc.role !== "editor") return;

    saveMutation.mutate(debouncedContent);
  }, [debouncedContent]);

  if (!doc || !editor) return null;

  return (
    <EditorContext.Provider value={providerValue}>
      <div className="flex flex-1 flex-col">
        <DocumentHeader
          key={id}
          documentId={id}
          setCommentsOpen={setCommentsOpen}
        />

        {doc.role === "editor" && <DocumentToolbar />}

        <DocumentEditor />

        {commentsOpen && (
          <CommentsSidebar
            documentId={id}
            canComment={doc.role === "editor"}
            currentUserId={doc.currentUserId}
            onClose={() => setCommentsOpen(false)}
          />
        )}
      </div>
    </EditorContext.Provider>
  );
}
