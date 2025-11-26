import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello Cloudflare Workers!"));

app.get("/api/hello", (c) => {
  return c.json({
    message: "Hello from API Service!",
    timestamp: new Date().toISOString(),
  });
});

export default app;
