import { Hocuspocus } from "@hocuspocus/server";
import type {
  onAuthenticatePayload,
  onLoadDocumentPayload,
  onStoreDocumentPayload,
  onDisconnectPayload,
} from "@hocuspocus/server";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { db } from "./db/client";
import { documents } from "./db/schema";
import { eq } from "drizzle-orm";
import { verifyCollabToken } from "./routes/documents/collab";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Underline,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TiptapImage,
  TiptapLink.configure({ openOnClick: false }),
  Highlight.configure({ multicolor: true }),
  TextStyle,
  Color,
  FontFamily,
  FontSize,
];

const COLORS = [
  "#E57373",
  "#81C784",
  "#64B5F6",
  "#FFD54F",
  "#BA68C8",
  "#4DB6AC",
  "#FF8A65",
  "#A1887F",
  "#90A4AE",
  "#F06292",
];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export const hocuspocus = new Hocuspocus({
  async onAuthenticate(data: onAuthenticatePayload) {
    const { token, documentName } = data;

    if (!token) {
      console.log("[Hocuspocus] No token provided");
      throw new Error("No token provided");
    }

    const payload = verifyCollabToken(token);

    if (!payload) {
      console.log("[Hocuspocus] Invalid or expired token");
      throw new Error("Invalid or expired token");
    }

    if (payload.documentId !== documentName) {
      console.log("[Hocuspocus] Token document mismatch");
      throw new Error("Token document mismatch");
    }

    const user = {
      id: payload.userId,
      name: payload.userName,
      email: payload.userEmail,
      image: payload.userImage,
      color: getRandomColor(),
      role: payload.role,
    };

    return { user };
  },

  async onLoadDocument(data: onLoadDocumentPayload) {
    const { document, documentName } = data;

    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentName),
    });

    if (!doc) {
      throw new Error("Document not found");
    }

    if (document.isEmpty("default")) {
      const content = doc.content as {
        type?: string;
        content?: unknown[];
      } | null;
      if (content && content.content && content.content.length > 0) {
        try {
          const ydocFromJson = TiptapTransformer.toYdoc(
            content,
            "default",
            extensions,
          );
          document.merge(ydocFromJson);
        } catch (error) {
          console.error("[Hocuspocus] Failed to initialize Y.Doc:", error);
        }
      }
    } else {
      console.log(
        "[Hocuspocus] Y.Doc already has content, skipping initialization",
      );
    }

    return document;
  },

  async onStoreDocument(data: onStoreDocumentPayload) {
    const { documentName, document } = data;

    try {
      const content = TiptapTransformer.fromYdoc(document, "default");

      await db
        .update(documents)
        .set({
          content,
          updatedAt: new Date(),
        })
        .where(eq(documents.id, documentName));
    } catch (error) {
      console.error("[Hocuspocus] Failed to store document:", error);
    }
  },

  async onDisconnect(data: onDisconnectPayload) {
    console.log(`User disconnected from document: ${data.documentName}`);
  },
});
