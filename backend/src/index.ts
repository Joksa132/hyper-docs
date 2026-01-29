import "dotenv/config";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { Hono } from "hono";
import { auth } from "./auth";
import { cors } from "hono/cors";
import { documentsRoute } from "./routes/documents";
import { publicRoute } from "./routes/public";
import { aiSelectionRoutes } from "./routes/ai/selection";
import { aiDocumentRoutes } from "./routes/ai/document";
import { hocuspocus } from "./collaboration";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");
      const originWithoutSlash = origin?.replace(/\/$/, "");
      if (originWithoutSlash === frontendUrl) {
        return origin;
      }
      return null;
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/documents", documentsRoute);

app.route("/api/ai/selection", aiSelectionRoutes);

app.route("/api/ai/document", aiDocumentRoutes);

app.route("/api/public", publicRoute);

app.get("/", (c) => {
  return c.text("API running!");
});

const port = Number(process.env.PORT) || 3000;

const server = createServer(async (req, res) => {
  const response = await app.fetch(
    new Request(`http://localhost${req.url}`, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
      duplex: "half",
    } as RequestInit)
  );

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (response.body) {
    const reader = response.body.getReader();
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) {
        res.end();
        return;
      }
      res.write(value);
      await pump();
    };
    await pump();
  } else {
    res.end();
  }
});

const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws, req) => {
  hocuspocus.handleConnection(ws, req);
});

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`WebSocket available at ws://localhost:${port}`);
});
