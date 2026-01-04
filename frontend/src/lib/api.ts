import type { SelectionAiAction } from "./types";

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function runSelectionAiCommand(payload: {
  action: SelectionAiAction;
  selectionText: string;
}) {
  const res = await fetch(`${API_URL}/api/ai/selection`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "AI request failed");
  }

  return (await res.json()) as { output: string };
}

export async function runDocumentAiCommand(payload: {
  action: "summarize";
  documentId: string;
}) {
  const res = await fetch(`${API_URL}/api/ai/document`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "AI request failed");
  }

  return (await res.json()) as { output: string };
}
