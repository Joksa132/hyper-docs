import type { Editor, JSONContent } from "@tiptap/react";

export const fontFamilies = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Calibri", value: "Calibri, Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: '"Courier New", Courier, monospace' },
  { label: "Inter", value: "Inter" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Open Sans", value: "Open Sans, sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
];

export const textColors = [
  "#000000",
  "#5f6368",
  "#8B0000",
  "#964B00",
  "#06402B",
  "#00008B",
  "#800080",
  "#008080",
  "#FF6347",
  "#FFA500",
  "#FFFF00",
  "#C49A6C",
  "#90EE90",
  "#00FFFF",
  "#ADD8E6",
  "#FFC0CB",
  "#D3D3D3",
  "#FFFFFF",
];

export const highlightColors = [
  "transparent",
  "#000000",
  "#5f6368",
  "#8B0000",
  "#964B00",
  "#06402B",
  "#00008B",
  "#800080",
  "#008080",
  "#FF6347",
  "#FFA500",
  "#FFFF00",
  "#C49A6C",
  "#90EE90",
  "#00FFFF",
  "#ADD8E6",
  "#FFC0CB",
  "#D3D3D3",
];

export function formatRelativeTime(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return `1m ago`;
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getSelectionText(editor: Editor) {
  const { from, to, empty } = editor.state.selection;
  if (empty) return { from, to, text: "" };

  const text = editor.state.doc.textBetween(from, to, "\n");
  return { from, to, text };
}

export function aiTextToTiptapNodes(text: string): JSONContent[] {
  const lines = text.split("\n");

  const nodes: JSONContent[] = [];
  let listItems: JSONContent[] | null = null;
  let listType: "bulletList" | "orderedList" | null = null;

  function flushList() {
    if (listItems && listType) {
      nodes.push({
        type: listType,
        content: listItems,
      });
    }
    listItems = null;
    listType = null;
  }

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
    if (headingMatch) {
      flushList();
      nodes.push({
        type: "heading",
        attrs: { level: headingMatch[1].length },
        content: [{ type: "text", text: headingMatch[2] }],
      });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (!listItems) listItems = [];
      listType = "orderedList";

      listItems.push({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: line.replace(/^\d+\.\s+/, ""),
              },
            ],
          },
        ],
      });
      continue;
    }

    if (/^[-*•]\s+/.test(line)) {
      if (!listItems) listItems = [];
      listType = "bulletList";

      listItems.push({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: line.replace(/^[-*•]\s+/, ""),
              },
            ],
          },
        ],
      });
      continue;
    }

    flushList();
    nodes.push({
      type: "paragraph",
      content: [{ type: "text", text: line }],
    });
  }

  flushList();
  return nodes;
}
