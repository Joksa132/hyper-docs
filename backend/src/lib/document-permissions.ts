import { db } from "../db/client";
import { documents, documentMembers } from "../db/schema";
import { and, eq } from "drizzle-orm";

export async function getDocumentAccess(documentId: string, userId: string) {
  const doc = await db.query.documents.findFirst({
    where: (d) => eq(d.id, documentId),
  });

  if (!doc) return null;

  if (doc.ownerId === userId) {
    return { role: "editor" as const, isOwner: true };
  }

  const member = await db.query.documentMembers.findFirst({
    where: (m) => and(eq(m.documentId, documentId), eq(m.userId, userId)),
  });

  if (!member) return null;

  return { role: member.role, isOwner: false };
}
