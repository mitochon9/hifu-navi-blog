import { describe, expect, test } from "bun:test";
import type { TasksRepository } from "../../domain/tasks.repository";
import { makeGetStatus } from "./usecase";

describe("tasks.status usecase", () => {
  test("ok: returns status successfully", async () => {
    const mockJob = {
      id: "job-123",
      status: "processing" as const,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };
    const tasksRepository: TasksRepository = {
      createJob: async () => mockJob,
      getJob: async () => mockJob,
      markProcessing: async () => null,
      markDone: async () => null,
      countDone: async () => 0,
    };
    const usecase = makeGetStatus({ tasksRepository });
    const r = await usecase({ id: "job-123" });
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value.id).toBe("job-123");
      expect(r.value.status).toBe("processing");
    }
  });
});
