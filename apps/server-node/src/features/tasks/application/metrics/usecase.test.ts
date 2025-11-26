import { describe, expect, test } from "bun:test";
import type { TasksRepository } from "../../domain/tasks.repository";
import { makeGetMetrics } from "./usecase";

describe("tasks.metrics usecase", () => {
  test("ok: returns metrics successfully", async () => {
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
      countDone: async () => 100,
    };
    const usecase = makeGetMetrics({ tasksRepository });
    const r = await usecase(null);
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value.totalDone).toBe(100);
    }
  });
});
