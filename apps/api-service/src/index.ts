import { Hono } from "hono";

const app = new Hono();
app.get("/", (c) => c.text("Hello Bun!"));

export default {
  port: 3001,
  fetch: app.fetch,
};
