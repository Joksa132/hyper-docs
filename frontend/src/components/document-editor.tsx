import { EditorContent, useCurrentEditor } from "@tiptap/react";

type DocumentEditorProps = {
  zoom?: number;
};

export function DocumentEditor({ zoom = 100 }: DocumentEditorProps) {
  const { editor } = useCurrentEditor();

  const scale = zoom / 100;

  return (
    <div className="flex flex-1 justify-center overflow-y-auto bg-muted/30 py-10">
      <div
        className="bg-white shadow-md rounded-sm w-full max-w-[850px] origin-top"
        style={{
          transform: `scale(${scale})`,
          marginBottom: scale !== 1 ? `${(scale - 1) * 100}%` : undefined,
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
