import { describe, expect, test } from "bun:test";
import type { TasksRepository } from "../../domain/tasks.repository";
import { makeMarkDone, makeMarkProcessing } from "./usecase";

describe("tasks.update usecase", () => {
  describe("makeMarkProcessing", () => {
    test("ok: marks processing successfully", async () => {
      const mockJob = {
        id: "job-123",
        status: "processing" as const,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };
      const tasksRepository: TasksRepository = {
        createJob: async () => mockJob,
        getJob: async () => null,
        markProcessing: async () => mockJob,
        markDone: async () => null,
        countDone: async () => 0,
      };
      const usecase = makeMarkProcessing({ tasksRepository });
      const r = await usecase({ id: "job-123" });
      expect(r.type).toBe("ok");
      if (r.type === "ok") {
        expect(r.value.id).toBe("job-123");
        expect(r.value.status).toBe("processing");
      }
    });
  });

  describe("makeMarkDone", () => {
    test("ok: marks done successfully", async () => {
      const mockJob = {
        id: "job-123",
        status: "done" as const,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        result: {
          message: "Task completed",
          finishedAt: "2024-01-01T01:00:00Z",
        },
      };
      const tasksRepository: TasksRepository = {
        createJob: async () => mockJob,
        getJob: async () => null,
        markProcessing: async () => null,
        markDone: async () => mockJob,
        countDone: async () => 0,
      };
      const usecase = makeMarkDone({ tasksRepository });
      const r = await usecase({
        id: "job-123",
        result: {
          message: "Task completed",
          finishedAt: "2024-01-01T01:00:00Z",
        },
      });
      expect(r.type).toBe("ok");
      if (r.type === "ok") {
        expect(r.value.id).toBe("job-123");
        expect(r.value.status).toBe("done");
      }
    });
  });
});
