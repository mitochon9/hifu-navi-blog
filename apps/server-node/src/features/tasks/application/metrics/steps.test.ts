import { describe, expect, test } from "bun:test";
import type { TasksRepository } from "../../domain/tasks.repository";
import { makeCountDoneStep } from "./steps";

describe("tasks.metrics steps", () => {
  test("ok: returns count from repository", async () => {
    const tasksRepository: TasksRepository = {
      createJob: async () => ({
        id: "job-1",
        status: "queued" as const,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      }),
      getJob: async () => null,
      markProcessing: async () => null,
      markDone: async () => null,
      countDone: async () => 42,
    };
    const step = makeCountDoneStep({ tasksRepository });
    const r = await step(null);
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value.totalDone).toBe(42);
    }
  });

  test("err: Unexpected when repository throws", async () => {
    const tasksRepository: TasksRepository = {
      createJob: async () => ({
        id: "job-1",
        status: "queued" as const,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      }),
      getJob: async () => null,
      markProcessing: async () => null,
      markDone: async () => null,
      countDone: async () => {
        throw new Error("DB error");
      },
    };
    const step = makeCountDoneStep({ tasksRepository });
    const r = await step(null);
    expect(r.type).toBe("err");
    if (r.type === "err") {
      expect(r.value).toBe("Unexpected");
    }
  });
});
