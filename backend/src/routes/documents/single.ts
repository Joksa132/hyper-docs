import { Hono } from "hono";
import { getUser } from "../../lib/get-user";
import { nanoid } from "nanoid";
import { db } from "../../db/client";
import { documents, documentStars } from "../../db/schema";
import { getTableColumns, and, eq, isNotNull } from "drizzle-orm";
import { getDocumentAccess } from "../../lib/document-permissions";

export const singleRoutes = new Hono();

// POST / - create a new document
singleRoutes.post("/", async (c) => {
  const user = await getUser(c.req.raw);

  const id = nanoid();

  await db.insert(documents).values({
    id,
    ownerId: user.id,
    title: "Untitled document",
    content: { type: "doc", content: [] },
  });

  return c.json({ id });
});

// GET /:id - get a document
singleRoutes.get("/:id", async (c) => {
  const user = await getUser(c.req.raw);
  const id = c.req.param("id");

  const doc = await db
    .select({
      ...getTableColumns(documents),
      isStarred: documentStars.id,
    })
    .from(documents)
    .leftJoin(
      documentStars,
      and(
        eq(documentStars.documentId, documents.id),
        eq(documentStars.userId, user.id)
      )
    )
    .where(eq(documents.id, id))
    .then((r) => r[0]);

  const access = await getDocumentAccess(id, user.id);

  if (!access) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json({
    ...doc,
    isStarred: Boolean(doc.isStarred),
    role: access.role,
    isOwner: access.isOwner,
    currentUserId: user.id,
  });
});

// PATCH /:id - update a document
singleRoutes.patch("/:id", async (c) => {
  const user = await getUser(c.req.raw);
  const id = c.req.param("id");
  const body = await c.req.json();

  const doc = await db.query.documents.findFirst({
    where: (d, { eq }) => eq(d.id, id),
  });

  if (!doc) {
    return c.json({ error: "Document not found" }, 404);
  }

  const access = await getDocumentAccess(id, user.id);

  if (!access || access.role !== "editor") {
    return c.json({ error: "Forbidden" }, 403);
  }

  await db
    .update(documents)
    .set({
      title: body.title ?? doc.title,
      content: body.content ?? doc.content,
    })
    .where(eq(documents.id, id));

  return c.json({ success: true });
});

// POST /:id/trash - put a document into trash
singleRoutes.post("/:id/trash", async (c) => {
  const user = await getUser(c.req.raw);
  const id = c.req.param("id");

  await db
    .update(documents)
    .set({ trashedAt: new Date() })
    .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)));

  return c.json({ trashed: true });
});

// POST /:id/restore - restore a document from trash
singleRoutes.post("/:id/restore", async (c) => {
  const user = await getUser(c.req.raw);
  const id = c.req.param("id");

  await db
    .update(documents)
    .set({ trashedAt: null })
    .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)));

  return c.json({ restored: true });
});

// DELETE /:id - completely delete a document
singleRoutes.delete("/:id", async (c) => {
  const user = await getUser(c.req.raw);
  const id = c.req.param("id");

  const doc = await db.query.documents.findFirst({
    where: (d, { and, eq, isNotNull }) =>
      and(eq(d.id, id), eq(d.ownerId, user.id), isNotNull(d.trashedAt)),
  });

  if (!doc) {
    return c.json({ error: "Not found or not in trash" }, 404);
  }

  await db.delete(documents).where(eq(documents.id, id));

  return c.json({ deleted: true });
});
