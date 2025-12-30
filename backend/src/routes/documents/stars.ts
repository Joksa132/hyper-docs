import { Hono } from "hono";
import { db } from "../../db/client";
import { documents, documentStars } from "../../db/schema";
import { getUser } from "../../lib/get-user";
import { nanoid } from "nanoid";
import { and, eq } from "drizzle-orm";

export const starRoutes = new Hono();

// POST /:id/star - star a document
starRoutes.post("/:id/star", async (c) => {
  const user = await getUser(c.req.raw);
  const documentId = c.req.param("id");

  const doc = await db.query.documents.findFirst({
    where: (d, { eq }) => eq(d.id, documentId),
  });

  if (!doc || doc.ownerId !== user.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  await db
    .insert(documentStars)
    .values({
      id: nanoid(),
      documentId,
      userId: user.id,
    })
    .onConflictDoNothing();

  return c.json({ starred: true });
});

// DELETE /:id/star - unstar a document
starRoutes.delete("/:id/star", async (c) => {
  const user = await getUser(c.req.raw);
  const documentId = c.req.param("id");

  const doc = await db.query.documents.findFirst({
    where: (d, { eq }) => eq(d.id, documentId),
  });

  if (!doc || doc.ownerId !== user.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  await db
    .delete(documentStars)
    .where(
      and(
        eq(documentStars.documentId, documentId),
        eq(documentStars.userId, user.id)
      )
    );

  return c.json({ starred: false });
});
