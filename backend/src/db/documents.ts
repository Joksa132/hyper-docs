import {
  pgTable,
  text,
  timestamp,
  index,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "../../auth-schema";

export const documents = pgTable(
  "documents",
  {
    id: text("id").primaryKey(),

    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    title: text("title").notNull(),

    content: jsonb("content").notNull(),

    isPublic: boolean("is_public").default(false).notNull(),

    publicToken: text("public_token").unique(),

    trashedAt: timestamp("trashed_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("documents_ownerId_idx").on(t.ownerId),
    index("documents_publicToken_idx").on(t.publicToken),
    index("documents_trashedAt_idx").on(t.trashedAt),
  ]
);
