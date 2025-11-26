import { createApp as createHonoApp, createHttpLogger } from "@repo/server-kit";
import type { Context } from "hono";
import { cors } from "hono/cors";
import { etag } from "hono/etag";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import { loadConfig } from "./config";
import { createContainer } from "./container";
import { setCacheHeaders } from "./middlewares/cache";
import { attachResponseRequestId } from "./middlewares/request-id-response";
import { composeRoutes } from "./routes/compose";

export function createApp() {
  const app = createHonoApp();
  const config = loadConfig();
  const container = createContainer(config);

  app.use(
    "*",
    requestId({
      headerName: "x-request-id",
    })
  );
  if (config.logPretty === "true") {
    app.use("*", logger());
  }
  app.use("*", createHttpLogger({ environment: config.nodeEnv }));
  app.use("*", timing());
  app.use("*", secureHeaders());
  app.use(
    "*",
    cors({
      origin: config.corsOrigin ?? "*",
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-request-id"],
      exposeHeaders: ["ETag", "x-request-id"],
      maxAge: 600,
      credentials: true,
    })
  );
  if (config.nodeEnv !== "production") {
    app.use("*", prettyJSON());
  }
  app.use("*", etag());
  app.use("*", setCacheHeaders("public, max-age=60, s-maxage=300"));
  app.use("*", attachResponseRequestId("x-request-id"));

  const routes = composeRoutes(app, container, config)
    .get("/", (c: Context) => c.json({ ok: true, message: "Hello Server!" }))
    .notFound((c: Context) => c.json({ ok: false, error: "Not Found" }, 404))
    .onError((err: unknown, c: Context) => {
      const rid = c.get("requestId");
      if (config.nodeEnv !== "production") {
        const detail =
          typeof err === "object" && err !== null && "stack" in err
            ? String((err as { stack?: unknown }).stack)
            : String(err);
        return c.json(
          {
            ok: false,
            error: "Internal Server Error",
            requestId: rid,
            detail,
          },
          500
        );
      }
      return c.json({ ok: false, error: "Internal Server Error", requestId: rid }, 500);
    });

  return routes;
}
