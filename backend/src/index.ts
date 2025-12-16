import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "./auth";
import { cors } from "hono/cors";
import { documentsRoute } from "./routes/documents";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/documents", documentsRoute);

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
