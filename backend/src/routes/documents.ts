import { Hono } from "hono";
import { db } from "../db/client";
import { documents } from "../db/schema";
import { getUser } from "../lib/get-user";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export const documentsRoute = new Hono();

documentsRoute.get("/", async (c) => {
  const user = await getUser(c.req.raw);

  const docs = await db
    .select({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.ownerId, user.id))
    .orderBy(documents.updatedAt);

  return c.json(docs);
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

  const doc = await db.query.documents.findFirst({
    where: (d, { eq }) => eq(d.id, id),
  });

  if (!doc) {
    return c.notFound();
  }

  if (doc.ownerId !== user.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json(doc);
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
