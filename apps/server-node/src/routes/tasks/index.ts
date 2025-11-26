import { sValidator } from "@hono/standard-validator";
import type { EnqueueTaskResponse, TaskStatusResponse } from "@repo/contracts";
import type { ReqLogger } from "@repo/server-kit";
import { Hono } from "hono";
import { z } from "zod";
import type { TasksService } from "../../features/tasks/application/service";
import { createVerifyOidcMiddleware } from "../../middlewares/verify-oidc";
import { toHttp } from "../../shared/http";

export function createTasksRouter(cntr: { tasks: TasksService }) {
  const app = new Hono<{
    Variables: { logger?: ReqLogger };
  }>()
    // enqueue: ジョブ投入
    .post("/enqueue", async (c) => {
      const logger = c.get("logger");
      const result = await cntr.tasks.enqueue();
      const mapped = toHttp<EnqueueTaskResponse, "Invalid" | "Unexpected">(result, 201);
      if (mapped.status === 500) {
        logger?.error({
          evt: "enqueue_error",
          mod: "tasks",
          error: "Failed to enqueue task",
          responseBody: mapped.body,
        });
      }
      return c.json(mapped.body, mapped.status);
    })
    // metrics: 累計完了数
    .get("/metrics", async (c) => {
      const result = await cntr.tasks.getMetrics();
      const { status, body } = toHttp<{ totalDone: number }, "Unexpected">(result);
      c.header("Cache-Control", "no-store");
      return c.json(body, status);
    })
    // status: ステータス確認
    .get(
      "/status/:id",
      sValidator("param", z.object({ id: z.string().min(1).max(36) }).strict()),
      async (c) => {
        const { id } = c.req.valid("param");
        const result = await cntr.tasks.getStatus({ id });
        const { status, body } = toHttp<TaskStatusResponse, "NotFound" | "Unexpected">(result);
        c.header("Cache-Control", "no-store");
        return c.json(body, status);
      }
    );

  return app;
}

// 外部ワーカーからのコールバック（processing/done）
export function createTasksCallbackRouter(
  cntr: { tasks: TasksService },
  config: {
    workerServiceAccountEmail?: string;
    serverInternalUrl: string;
    nodeEnv: string;
  }
) {
  const { workerServiceAccountEmail, serverInternalUrl, nodeEnv } = config;

  // OIDC検証ミドルウェア（本番環境でのみ有効）
  const verifyOidc =
    workerServiceAccountEmail && serverInternalUrl
      ? createVerifyOidcMiddleware({
          allowedServiceAccountEmails: [workerServiceAccountEmail],
          expectedAudience: serverInternalUrl,
          nodeEnv,
          skipInDevelopment: true,
        })
      : undefined;

  const app = new Hono<{
    Variables: { logger?: ReqLogger };
  }>();

  // OIDC検証を適用（ミドルウェアが定義されている場合）
  if (verifyOidc) {
    app.use("*", verifyOidc);
  }

  return app
    .post(
      "/processing",
      sValidator("json", z.object({ jobId: z.string().min(1).max(36) }).strict()),
      async (c) => {
        const { jobId } = c.req.valid("json");
        const result = await cntr.tasks.markProcessing({ id: jobId });
        const { status, body } = toHttp<{ id: string; status: string }, "NotFound" | "Unexpected">(
          result
        );
        return c.json(body, status);
      }
    )
    .post(
      "/done",
      sValidator(
        "json",
        z
          .object({
            jobId: z.string().min(1).max(36),
            message: z.string().min(1),
            finishedAt: z.string().min(1),
          })
          .strict()
      ),
      async (c) => {
        const body = c.req.valid("json");
        const result = await cntr.tasks.markDone({
          id: body.jobId,
          result: {
            message: body.message,
            finishedAt: body.finishedAt,
          },
        });
        const { status, body: resBody } = toHttp<
          { id: string; status: string },
          "NotFound" | "Unexpected"
        >(result);
        return c.json(resBody, status);
      }
    );
}
