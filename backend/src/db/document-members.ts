import { pgTable, text, timestamp, index, unique } from "drizzle-orm/pg-core";
import { users } from "../../auth-schema";
import { documents } from "./documents";

export const documentMembers = pgTable(
  "document_members",
  {
    documentId: text("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    invitedById: text("invited_by_id").references(() => users.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    unique("document_members_document_user_unique").on(t.documentId, t.userId),
    index("document_members_userId_idx").on(t.userId),
    index("document_members_documentId_idx").on(t.documentId),
  ]
);
