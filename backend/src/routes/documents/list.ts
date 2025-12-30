import { Hono } from "hono";
import { getUser } from "../../lib/get-user";
import {
  and,
  eq,
  isNull,
  isNotNull,
  ilike,
  desc,
  getTableColumns,
} from "drizzle-orm";
import {
  documents,
  documentStars,
  documentMembers,
  users,
} from "../../db/schema";
import { db } from "../../db/client";

export const listRoutes = new Hono();

// GET / - all owned documents
listRoutes.get("/", async (c) => {
  const user = await getUser(c.req.raw);
  const search = c.req.query("search");

  const where = and(
    eq(documents.ownerId, user.id),
    isNull(documents.trashedAt),
    search ? ilike(documents.title, `%${search}%`) : undefined
  );

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
    .where(where)
    .orderBy(desc(documents.updatedAt));

  return c.json(
    docs.map((d) => ({
      ...d,
      isStarred: Boolean(d.isStarred),
    }))
  );
});

// GET /trash - all owned trash documents
listRoutes.get("/trash", async (c) => {
  const user = await getUser(c.req.raw);

  const docs = await db
    .select({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(and(eq(documents.ownerId, user.id), isNotNull(documents.trashedAt)))
    .orderBy(desc(documents.trashedAt));

  return c.json(docs);
});

// GET /shared - all documents shared with user
listRoutes.get("/shared", async (c) => {
  const user = await getUser(c.req.raw);

  const docs = await db
    .select({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
      createdAt: documents.createdAt,
      ownerName: users.name,
    })
    .from(documentMembers)
    .innerJoin(documents, eq(documents.id, documentMembers.documentId))
    .innerJoin(users, eq(users.id, documents.ownerId))
    .where(
      and(eq(documentMembers.userId, user.id), isNull(documents.trashedAt))
    )
    .orderBy(desc(documents.updatedAt));

  return c.json(docs);
});

// GET /starred - all owned starred documents
listRoutes.get("/starred", async (c) => {
  const user = await getUser(c.req.raw);

  const docs = await db
    .select({
      ...getTableColumns(documents),
      isStarred: documentStars.id,
    })
    .from(documentStars)
    .innerJoin(documents, eq(documents.id, documentStars.documentId))
    .where(and(eq(documentStars.userId, user.id), isNull(documents.trashedAt)))
    .orderBy(desc(documents.updatedAt));

  return c.json(
    docs.map((d) => ({
      ...d,
      isStarred: true,
    }))
  );
});
