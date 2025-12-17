import { Hono } from "hono";
import { db } from "../db/client";
import { documents, documentStars } from "../db/schema";
import { getUser } from "../lib/get-user";
import { nanoid } from "nanoid";
import { and, eq, getTableColumns } from "drizzle-orm";

export const documentsRoute = new Hono();

documentsRoute.get("/", async (c) => {
  const user = await getUser(c.req.raw);

  const docs = await db
    .select({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
      createdAt: documents.createdAt,
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
    .where(eq(documents.ownerId, user.id))
    .orderBy(documents.updatedAt);

  return c.json(
    docs.map((d) => ({
      ...d,
      isStarred: Boolean(d.isStarred),
    }))
  );
});

documentsRoute.post("/", async (c) => {
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

documentsRoute.get("/:id", async (c) => {
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

  if (!doc) {
    return c.notFound();
  }

  if (doc.ownerId !== user.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json({
    ...doc,
    isStarred: Boolean(doc.isStarred),
  });
});

documentsRoute.patch("/:id", async (c) => {
  const user = await getUser(c.req.raw);
  const id = c.req.param("id");
  const body = await c.req.json();

  const doc = await db.query.documents.findFirst({
    where: (d, { eq }) => eq(d.id, id),
  });

  if (!doc || doc.ownerId !== user.id) {
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

documentsRoute.post("/:id/star", async (c) => {
  const user = await getUser(c.req.raw);
  const documentId = c.req.param("id");

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

documentsRoute.delete("/:id/star", async (c) => {
  const user = await getUser(c.req.raw);
  const documentId = c.req.param("id");

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
