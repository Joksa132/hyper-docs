import { Hono } from "hono";
import { createHmac } from "crypto";
import { getUser } from "../../lib/get-user";
import { getDocumentAccess } from "../../lib/document-permissions";

export const collabRoutes = new Hono();

const SECRET = process.env.BETTER_AUTH_SECRET || "fallback-secret";

export function createCollabToken(data: {
  documentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userImage?: string | null;
  role: "viewer" | "editor";
}) {
  const payload = {
    ...data,
    exp: Date.now() + 15 * 60 * 1000,
  };

  const payloadStr = JSON.stringify(payload);
  const signature = createHmac("sha256", SECRET)
    .update(payloadStr)
    .digest("base64url");

  return `${Buffer.from(payloadStr).toString("base64url")}.${signature}`;
}

export function verifyCollabToken(token: string) {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const payloadStr = Buffer.from(payloadB64, "base64url").toString();
    const expectedSig = createHmac("sha256", SECRET)
      .update(payloadStr)
      .digest("base64url");

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(payloadStr);

    if (payload.exp < Date.now()) return null;

    return payload as {
      documentId: string;
      userId: string;
      userName: string;
      userEmail: string;
      userImage?: string | null;
      role: "viewer" | "editor";
    };
  } catch {
    return null;
  }
}

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

// GET /:id/collab-token - get a token for WebSocket collaboration
collabRoutes.get("/:id/collab-token", async (c) => {
  const user = await getUser(c.req.raw);
  const documentId = c.req.param("id");

  const access = await getDocumentAccess(documentId, user.id);

  if (!access) {
    return c.json({ error: "Access denied" }, 403);
  }

  const token = createCollabToken({
    documentId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userImage: user.image,
    role: access.role,
  });

  return c.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      color: getRandomColor(),
      role: access.role,
    },
  });
});
