import { pgTable, text, timestamp, unique, index } from "drizzle-orm/pg-core";
import { users } from "../../auth-schema";
import { documents } from "./documents";

export const documentStars = pgTable(
  "document_stars",
  {
    id: text("id").primaryKey(),
    documentId: text("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    unique("document_stars_document_user_unique").on(t.documentId, t.userId),
    index("document_stars_userId_idx").on(t.userId),
  ]
);
