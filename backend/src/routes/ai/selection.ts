import { Hono } from "hono";
import OpenAI from "openai";
import { getUser } from "../../lib/get-user";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const aiSelectionRoutes = new Hono();

// POST /ai/selection
aiSelectionRoutes.post("/", async (c) => {
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

  const { action, selectionText } = body ?? {};

  if (
    (action !== "rewrite" &&
      action !== "fix" &&
      action !== "shorten" &&
      action !== "expand") ||
    typeof selectionText !== "string" ||
    selectionText.trim().length === 0
  ) {
    return c.json({ error: "Invalid payload" }, 400);
  }

  const systemPrompt =
    "You are an assistant embedded in a document editor. " +
    "Return ONLY the transformed text. No explanations. No quotes.";

  let userPrompt: string;

  switch (action) {
    case "rewrite":
      userPrompt =
        `Rewrite the following text to improve clarity and flow ` +
        `while preserving the original meaning:\n\n${selectionText}`;
      break;

    case "fix":
      userPrompt = `Fix grammar, spelling, and clarity without changing meaning:\n\n${selectionText}`;
      break;

    case "shorten":
      userPrompt = `Shorten the following text while keeping all important information:\n\n${selectionText}`;
      break;

    case "expand":
      userPrompt = `Expand the following text with more detail, keeping the same tone:\n\n${selectionText}`;
      break;

    default:
      return c.json({ error: "Unsupported action" }, 400);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.4,
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
    console.error("AI error:", err);
    return c.json({ error: "AI generation failed" }, 500);
  }
});
