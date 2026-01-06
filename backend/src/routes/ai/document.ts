import { Hono } from "hono";
import OpenAI from "openai";
import { getUser } from "../../lib/get-user";
import { getDocumentAccess } from "../../lib/document-permissions";
import { db } from "../../db/client";
import { documents } from "../../db/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const aiDocumentRoutes = new Hono();

// POST /api/ai/document
aiDocumentRoutes.post("/", async (c) => {
  const user = await getUser(c.req.raw);
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const { action, documentId } = body ?? {};

  if (action !== "summarize" || typeof documentId !== "string") {
    return c.json({ error: "Invalid payload" }, 400);
  }

  const access = await getDocumentAccess(documentId, user.id);
  if (!access) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const doc = await db.query.documents.findFirst({
    where: (d, { eq }) => eq(d.id, documentId),
    columns: {
      title: true,
      content: true,
    },
  });

  if (!doc) {
    return c.json({ error: "Document not found" }, 404);
  }

  function extractText(node: any): string {
    if (!node) return "";
    if (node.type === "text") return node.text ?? "";
    if (!node.content) return "";
    return node.content.map(extractText).join(" ");
  }

  const plainText = extractText(doc.content);

  if (!plainText.trim()) {
    return c.json({ output: "This document is empty." });
  }

  const systemPrompt =
    "You are an assistant embedded in a document editor. " +
    "Return clean, well-structured text only. " +
    "Use paragraphs, bullet points (-), numbered lists (1.), and headings (##) where appropriate. " +
    "Do not mention that this is a summary.";

  const userPrompt =
    `Summarize the following document in a clear, concise way.\n\n` +
    `Title: ${doc.title ?? "Untitled"}\n\n` +
    plainText;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const output = completion.choices[0]?.message?.content;

    if (!output) {
      return c.json({ error: "Empty AI response" }, 500);
    }

    return c.json({ output });
  } catch (err) {
    console.error("AI summarize error:", err);
    return c.json({ error: "AI generation failed" }, 500);
  }
});
