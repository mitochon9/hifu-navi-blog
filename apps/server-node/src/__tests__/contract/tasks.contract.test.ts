import { describe, expect, test } from "bun:test";
import {
  EnqueueTaskResponseSchema,
  TaskMetricsResponseSchema,
  TaskStatusResponseSchema,
} from "@repo/contracts";
import { err, ok } from "@repo/result";
import { Hono } from "hono";
import type { TasksService } from "../../features/tasks/application/service";
import { createTasksRouter } from "../../routes/tasks";

const stubService: TasksService = {
  enqueue: async () =>
    ok({
      jobId: "job-1",
    }),
  getStatus: async ({ id }) =>
    id === "job-1"
      ? ok({
          id,
          status: "done",
          result: {
            message: "ok",
            finishedAt: new Date().toISOString(),
          },
        })
      : err("NotFound"),
  markProcessing: async () =>
    ok({
      id: "job-1",
      status: "processing",
    }),
  markDone: async () =>
    ok({
      id: "job-1",
      status: "done",
    }),
  getMetrics: async () =>
    ok({
      totalDone: 1,
    }),
};

describe("contract: tasks routes", () => {
  const app = new Hono().route("/", createTasksRouter({ tasks: stubService }));

  test("POST /enqueue returns EnqueueTaskResponseSchema", async () => {
    const res = await app.request("/enqueue", { method: "POST" });
    expect(res.status).toBe(201);
    const json = (await res.json()) as unknown;
    expect(() => EnqueueTaskResponseSchema.parse(json)).not.toThrow();
  });

  test("GET /metrics returns TaskMetricsResponseSchema", async () => {
    const res = await app.request("/metrics");
    expect(res.status).toBe(200);
    const json = (await res.json()) as unknown;
    expect(() => TaskMetricsResponseSchema.parse(json)).not.toThrow();
  });

  test("GET /status/:id returns TaskStatusResponseSchema", async () => {
    const res = await app.request("/status/job-1");
    expect(res.status).toBe(200);
    const json = (await res.json()) as unknown;
    expect(() => TaskStatusResponseSchema.parse(json)).not.toThrow();
  });
});
