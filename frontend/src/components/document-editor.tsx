import { EditorContent, useCurrentEditor } from "@tiptap/react";

export function DocumentEditor() {
  const { editor } = useCurrentEditor();

  return (
    <div className="flex flex-1 justify-center overflow-y-auto bg-muted/30 py-10">
      <div className="bg-white shadow-md rounded-sm w-full max-w-[850px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
