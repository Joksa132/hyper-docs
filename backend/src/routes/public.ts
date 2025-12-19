import { Hono } from "hono";
import { db } from "../db/client";
import { eq, and, isNull } from "drizzle-orm";

export const publicRoute = new Hono();

publicRoute.get("/:token", async (c) => {
  const token = c.req.param("token");

  const doc = await db.query.documents.findFirst({
    where: (d) =>
      and(eq(d.publicToken, token), eq(d.isPublic, true), isNull(d.trashedAt)),
  });

  if (!doc) {
    return c.notFound();
  }

  return c.json(doc);
});
