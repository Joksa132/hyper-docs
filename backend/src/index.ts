import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "./auth";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "/api/auth/*",
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/", (c) => {
  return c.text("API running!");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
