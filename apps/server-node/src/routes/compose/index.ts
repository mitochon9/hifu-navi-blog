import type { createApp } from "@repo/server-kit";
import { createApp as createHonoApp } from "@repo/server-kit";
import { RegExpRouter } from "hono/router/reg-exp-router";
import type { AppConfig } from "../../config";
import type { createContainer } from "../../container";
import { healthRouter } from "../health";
import { createTasksCallbackRouter, createTasksRouter } from "../tasks";
import { createUsersRouter } from "../users";

export function composeRoutes(
  app: ReturnType<typeof createApp>,
  cntr: ReturnType<typeof createContainer>,
  config: AppConfig
) {
  // `/api` をベースパスとして設定
  // これにより、内部ルーティングは `/users` などのままで、
  // 実際のエンドポイントは `/api/users` になり、型も `api.users` になる
  const apiRoutes = createHonoApp({ router: new RegExpRouter() })
    .route("/health", healthRouter)
    .route("/users", createUsersRouter(cntr))
    .route("/tasks", createTasksRouter(cntr))
    .route(
      "/tasks/callback",
      createTasksCallbackRouter(cntr, {
        workerServiceAccountEmail: config.workerServiceAccountEmail,
        serverInternalUrl: config.serverInternalUrl,
        nodeEnv: config.nodeEnv,
      })
    );

  return app.route("/api", apiRoutes);
}
