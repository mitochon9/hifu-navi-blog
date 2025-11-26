import { describe, expect, test } from "bun:test";
import type { TasksRepository } from "../../domain/tasks.repository";
import { makeFetchJobStep } from "./steps";

describe("tasks.status steps", () => {
  test("ok: returns job when found", async () => {
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
    const step = makeFetchJobStep({ tasksRepository });
    const r = await step({ id: "job-123" });
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value.id).toBe("job-123");
      expect(r.value.status).toBe("processing");
    }
  });

  test("ok: returns job with result when done", async () => {
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
      getJob: async () => mockJob,
      markProcessing: async () => null,
      markDone: async () => null,
      countDone: async () => 0,
    };
    const step = makeFetchJobStep({ tasksRepository });
    const r = await step({ id: "job-123" });
    expect(r.type).toBe("ok");
    if (r.type === "ok") {
      expect(r.value.id).toBe("job-123");
      expect(r.value.status).toBe("done");
      expect(r.value.result).toEqual({
        message: "Task completed",
        finishedAt: "2024-01-01T01:00:00Z",
      });
    }
  });

  test("err: NotFound when job not found", async () => {
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
      countDone: async () => 0,
    };
    const step = makeFetchJobStep({ tasksRepository });
    const r = await step({ id: "non-existent" });
    expect(r.type).toBe("err");
    if (r.type === "err") {
      expect(r.value).toBe("NotFound");
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
      getJob: async () => {
        throw new Error("DB error");
      },
      markProcessing: async () => null,
      markDone: async () => null,
      countDone: async () => 0,
    };
    const step = makeFetchJobStep({ tasksRepository });
    const r = await step({ id: "job-123" });
    expect(r.type).toBe("err");
    if (r.type === "err") {
      expect(r.value).toBe("Unexpected");
    }
  });
});
