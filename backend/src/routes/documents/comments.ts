import { Hono } from "hono";
import { db } from "../../db/client";
import { documentComments, users } from "../../db/schema";
import { getUser } from "../../lib/get-user";
import { getDocumentAccess } from "../../lib/document-permissions";
import { nanoid } from "nanoid";
import { asc, eq } from "drizzle-orm";

export const commentRoutes = new Hono();

// GET /:id/comments - get comments for a document
commentRoutes.get("/:id/comments", async (c) => {
  const user = await getUser(c.req.raw);
  const documentId = c.req.param("id");

  const access = await getDocumentAccess(documentId, user.id);
  if (!access) return c.json({ error: "Forbidden" }, 403);

  const comments = await db
    .select({
      id: documentComments.id,
      content: documentComments.content,
      createdAt: documentComments.createdAt,
      authorId: users.id,
      authorName: users.name,
    })
    .from(documentComments)
    .innerJoin(users, eq(users.id, documentComments.authorId))
    .where(eq(documentComments.documentId, documentId))
    .orderBy(asc(documentComments.createdAt));

  return c.json(comments);
});

// POST /:id/comments - post a comment for a document
commentRoutes.post("/:id/comments", async (c) => {
  const user = await getUser(c.req.raw);
  const documentId = c.req.param("id");
  const { content } = await c.req.json();

  if (!content?.trim()) {
    return c.json({ error: "Empty comment" }, 400);
  }

  const access = await getDocumentAccess(documentId, user.id);
  if (!access || access.role !== "editor") {
    return c.json({ error: "Forbidden" }, 403);
  }

  await db.insert(documentComments).values({
    id: nanoid(),
    documentId,
    authorId: user.id,
    content,
  });

  return c.json({ success: true });
});

// DELETE /:id/comments/:commentId - delete a comment on a document
commentRoutes.delete("/:id/comments/:commentId", async (c) => {
  const user = await getUser(c.req.raw);
  const commentId = c.req.param("commentId");

  const comment = await db.query.documentComments.findFirst({
    where: (cmt, { eq }) => eq(cmt.id, commentId),
  });

  if (!comment || comment.authorId !== user.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  await db.delete(documentComments).where(eq(documentComments.id, commentId));

  return c.json({ success: true });
});
