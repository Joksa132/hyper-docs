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
import Collaboration from "@tiptap/extension-collaboration";
import { DocumentHeader } from "@/components/document-header";
import { DocumentToolbar } from "@/components/document-toolbar";
import { DocumentEditor } from "@/components/document-editor";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Document } from "@/lib/types";
import { CommentsSidebar } from "@/components/comments-sidebar";
import { useCollaboration } from "@/hooks/use-collaboration";

export const Route = createFileRoute("/document/$id")({
  loader: async ({ params }) => {
    const doc = await apiFetch<Document>(`/api/documents/${params.id}`);
    return { title: doc.title };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.title || "Document"} - HyperDocs` }],
  }),
  component: DocumentPageWrapper,
});

function DocumentPageWrapper() {
  const { id } = Route.useParams();
  return <DocumentPage key={id} id={id} />;
}

function DocumentPage({ id }: { id: string }) {
  const [commentsOpen, setCommentsOpen] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);

  const contentRef = useRef<JSONContent | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const didHydrateRef = useRef<boolean>(false);

  const queryClient = useQueryClient();

  const { provider, ydoc, isSynced, collaborators, setTyping } =
    useCollaboration(id);

  const getDocument = async (id: string) => {
    return apiFetch<Document>(`/api/documents/${id}`);
  };

  const { data: doc } = useQuery<Document>({
    queryKey: ["document", id],
    queryFn: () => getDocument(id),
  });

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
          history: false as const,
        } as Parameters<typeof StarterKit.configure>[0]),
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
        ...(provider
          ? [
              Collaboration.configure({
                document: ydoc,
                field: "default",
              }),
            ]
          : []),
      ],
      immediatelyRender: false,
      editable: false,
      onUpdate({ editor }) {
        if (doc?.role !== "editor") return;

        setTyping(true);

        contentRef.current = editor.getJSON();

        if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);

        saveTimerRef.current = window.setTimeout(() => {
          if (!contentRef.current) return;
          saveMutation.mutate(contentRef.current);
        }, 3000);
      },
    },
    [provider],
  );

  useEffect(() => {
    if (!editor || !doc || !isSynced) return;
    if (didHydrateRef.current) return;

    if (editor.isEmpty) {
      editor.commands.setContent(doc.content);
    }
    didHydrateRef.current = true;
  }, [editor, doc, isSynced]);

  useEffect(() => {
    if (!editor || !doc) return;
    editor.setEditable(doc.role === "editor");
  }, [editor, doc]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (doc?.title) {
      document.title = `${doc.title} - HyperDocs`;
    }
  }, [doc?.title]);

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

  if (!doc || !editor) return null;

  return (
    <EditorContext.Provider value={providerValue}>
      <div className="flex flex-1 flex-col">
        <DocumentHeader
          key={id}
          documentId={id}
          setCommentsOpen={setCommentsOpen}
          editor={editor}
          collaborators={collaborators}
        />

        {doc.role === "editor" && (
          <DocumentToolbar
            collaborators={collaborators}
            zoom={zoom}
            onZoomChange={setZoom}
          />
        )}

        <DocumentEditor zoom={zoom} />

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
