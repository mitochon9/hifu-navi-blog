import { sValidator } from "@hono/standard-validator";
import { enqueuePayloadSchema } from "@repo/contracts";
import type { ReqLogger } from "@repo/server-kit";
import { Hono } from "hono";
import type { TasksWorkerService } from "../../features/tasks/application/service";

export function createTasksRouter(cntr: { tasks: TasksWorkerService }) {
  const svc = cntr.tasks;
  const app = new Hono<{
    Variables: { logger?: ReqLogger };
  }>().post("/enqueue", sValidator("json", enqueuePayloadSchema), async (c) => {
    const logger = c.get("logger");
    const { jobId, callbackUrl } = c.req.valid("json");
    // 非同期処理は即座に202を返すため、エラーハンドリングを別途行う
    logger?.info({
      evt: "process_start",
      mod: "tasks",
      jobId,
      callbackUrl,
    });
    svc
      .processTask({ jobId, callbackUrl })
      .then((result) => {
        if (result.type === "err") {
          logger?.error({
            error: "Failed to process task",
            evt: "process_error",
            mod: "tasks",
            jobId,
            callbackUrl,
            errorValue: result.value,
          });
        } else {
          logger?.info({
            evt: "process_success",
            mod: "tasks",
            jobId,
            callbackUrl,
          });
        }
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger?.error({
          error: "Failed to process task (unexpected error)",
          evt: "process_error_unexpected",
          mod: "tasks",
          jobId,
          callbackUrl,
          message: errorMessage,
          stack: errorStack,
        });
      });
    return c.json({ accepted: true }, 202);
  });
  return app;
}
