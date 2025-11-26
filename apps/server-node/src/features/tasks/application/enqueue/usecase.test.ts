import { describe, expect, test } from "bun:test";
import { ok } from "@repo/result";
import type { TasksRepository } from "../../domain/tasks.repository";
import type { TaskDispatcher } from "../ports";
import { makeEnqueueTask } from "./usecase";

describe("tasks.enqueue usecase", () => {
  test("ok: enqueues task successfully", async () => {
    const mockJob = {
      id: "job-123",
      status: "queued" as const,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };
    const tasksRepository: TasksRepository = {
      createJob: async () => mockJob,
      getJob: async () => null,
      markProcessing: async () => null,
      markDone: async () => null,
      countDone: async () => 0,
    };
    const dispatcher: TaskDispatcher = {
      enqueue: async () => ok(undefined),
    };
    const usecase = makeEnqueueTask({
      tasksRepository,
      dispatcher,
      callbackBaseUrl: "https://example.com",
    });
    const r = await usecase();
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value.jobId).toBe("job-123");
    }
  });
});
