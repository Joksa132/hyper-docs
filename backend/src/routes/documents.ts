import { Hono } from "hono";
import { db } from "../db/client";
import {
  documentComments,
  documentMembers,
  documents,
  documentStars,
  users,
} from "../db/schema";
import { getUser } from "../lib/get-user";
import { nanoid } from "nanoid";
import {
  and,
  eq,
  getTableColumns,
  isNotNull,
  isNull,
  desc,
  ilike,
  asc,
} from "drizzle-orm";
import { getDocumentAccess } from "../lib/document-permissions";

export const documentsRoute = new Hono();

documentsRoute.get("/", async (c) => {
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

documentsRoute.get("/trash", async (c) => {
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

documentsRoute.get("/shared", async (c) => {
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

documentsRoute.get("/starred", async (c) => {
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

documentsRoute.post("/:id/star", async (c) => {
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

documentsRoute.delete("/:id/star", async (c) => {
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

documentsRoute.post("/:id/trash", async (c) => {
  const user = await getUser(c.req.raw);
  const id = c.req.param("id");

  await db
    .update(documents)
    .set({ trashedAt: new Date() })
    .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)));

  return c.json({ trashed: true });
});

documentsRoute.post("/:id/restore", async (c) => {
  const user = await getUser(c.req.raw);
  const id = c.req.param("id");

  await db
    .update(documents)
    .set({ trashedAt: null })
    .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)));

  return c.json({ restored: true });
});

documentsRoute.post("/:id/share", async (c) => {
  const user = await getUser(c.req.raw);
  const id = c.req.param("id");

  const token = nanoid(32);

  await db
    .update(documents)
    .set({
      isPublic: true,
      publicToken: token,
    })
    .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)));

  return c.json({ token });
});

documentsRoute.post("/:id/unshare", async (c) => {
  const user = await getUser(c.req.raw);
  const id = c.req.param("id");

  await db
    .update(documents)
    .set({
      isPublic: false,
      publicToken: null,
    })
    .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)));

  return c.json({ success: true });
});

documentsRoute.post("/:id/invite", async (c) => {
  const user = await getUser(c.req.raw);
  const documentId = c.req.param("id");
  const { email, role } = await c.req.json();

  if (!email || !["viewer", "editor"].includes(role)) {
    return c.json({ error: "Invalid payload" }, 400);
  }

  const doc = await db.query.documents.findFirst({
    where: (d, { eq }) => eq(d.id, documentId),
  });

  if (!doc || doc.ownerId !== user.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const invitedUser = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  });

  if (!invitedUser) {
    return c.json({ error: "User not found" }, 404);
  }

  await db
    .insert(documentMembers)
    .values({
      documentId,
      userId: invitedUser.id,
      role,
      invitedById: user.id,
    })
    .onConflictDoNothing();

  return c.json({ success: true });
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

documentsRoute.get("/:id/members", async (c) => {
  const user = await getUser(c.req.raw);
  const documentId = c.req.param("id");

  const doc = await db.query.documents.findFirst({
    where: (d, { eq }) => eq(d.id, documentId),
  });

  if (!doc || doc.ownerId !== user.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const members = await db
    .select({
      userId: documentMembers.userId,
      role: documentMembers.role,
      email: users.email,
      name: users.name,
    })
    .from(documentMembers)
    .innerJoin(users, eq(users.id, documentMembers.userId))
    .where(eq(documentMembers.documentId, documentId));

  return c.json(members);
});

documentsRoute.patch("/:id/members/:userId", async (c) => {
  const user = await getUser(c.req.raw);
  const documentId = c.req.param("id");
  const memberId = c.req.param("userId");
  const { role } = await c.req.json();

  if (!["viewer", "editor"].includes(role)) {
    return c.json({ error: "Invalid role" }, 400);
  }

  const doc = await db.query.documents.findFirst({
    where: (d, { eq }) => eq(d.id, documentId),
  });

  if (!doc || doc.ownerId !== user.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  await db
    .update(documentMembers)
    .set({ role })
    .where(
      and(
        eq(documentMembers.documentId, documentId),
        eq(documentMembers.userId, memberId)
      )
    );

  return c.json({ success: true });
});

documentsRoute.patch("/:id", async (c) => {
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

documentsRoute.delete("/:id", async (c) => {
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

documentsRoute.delete("/:id/members/:userId", async (c) => {
  const user = await getUser(c.req.raw);
  const documentId = c.req.param("id");
  const memberId = c.req.param("userId");

  const doc = await db.query.documents.findFirst({
    where: (d, { eq }) => eq(d.id, documentId),
  });

  if (!doc || doc.ownerId !== user.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  await db
    .delete(documentMembers)
    .where(
      and(
        eq(documentMembers.documentId, documentId),
        eq(documentMembers.userId, memberId)
      )
    );

  return c.json({ success: true });
});

documentsRoute.get("/:id/comments", async (c) => {
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

documentsRoute.post("/:id/comments", async (c) => {
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

documentsRoute.delete("/:id/comments/:commentId", async (c) => {
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
