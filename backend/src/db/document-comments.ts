import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { documents } from "./documents";
import { users } from "../../auth-schema";

export const documentComments = pgTable("document_comments", {
  id: text("id").primaryKey(),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),

  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  content: text("content").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
