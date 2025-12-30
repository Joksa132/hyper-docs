import { Hono } from "hono";
import { db } from "../../db/client";
import { documents, documentMembers, users } from "../../db/schema";
import { getUser } from "../../lib/get-user";
import { nanoid } from "nanoid";
import { and, eq } from "drizzle-orm";

export const sharingRoutes = new Hono();

// POST /:id/share - make a document public
sharingRoutes.post("/:id/share", async (c) => {
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

// POST /:id/unshare - make a document private again
sharingRoutes.post("/:id/unshare", async (c) => {
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

// POST /:id/invite - invite a user to have access to a document
sharingRoutes.post("/:id/invite", async (c) => {
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

// GET /:id/members - get users who have access to a document
sharingRoutes.get("/:id/members", async (c) => {
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

// PATCH /:id/members/:userId - update user's document access role
sharingRoutes.patch("/:id/members/:userId", async (c) => {
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

// DELETE /:id/members/:userId - remove user's access from a document
sharingRoutes.delete("/:id/members/:userId", async (c) => {
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
