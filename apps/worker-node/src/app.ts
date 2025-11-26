import { createApp as createHonoApp, createHttpLogger } from "@repo/server-kit";
import type { Context } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { timing } from "hono/timing";
import { loadConfig } from "./config";
import { createContainer } from "./container";
import { attachResponseRequestId } from "./middlewares/request-id-response";
import { healthRouter } from "./routes/health";
import { createTasksRouter } from "./routes/tasks";

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

  // Workerは内部呼び出し専用のため、CORS/ETag/Cache/SecureHeadersなどの
  // フロントエンド向けヘッダー制御は省略する

  if (config.nodeEnv !== "production") {
    app.use("*", prettyJSON());
  }

  app.use("*", attachResponseRequestId("x-request-id"));

  const routes = app
    .route("/health", healthRouter)
    .route("/tasks", createTasksRouter(container))
    .get("/", (c: Context) => c.json({ ok: true, message: "Hello Worker!" }))
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
