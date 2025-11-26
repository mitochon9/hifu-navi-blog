import { describe, expect, test } from "bun:test";
import type { TasksRepository } from "../../domain/tasks.repository";
import { makeMarkDoneStep, makeMarkProcessingStep } from "./steps";

describe("tasks.update steps", () => {
  describe("makeMarkProcessingStep", () => {
    test("ok: marks job as processing", async () => {
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
      const step = makeMarkProcessingStep({ tasksRepository });
      const r = await step({ id: "job-123" });
      expect(r.type).toBe("ok");
      if (r.type === "ok") {
        expect(r.value.id).toBe("job-123");
        expect(r.value.status).toBe("processing");
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
      const step = makeMarkProcessingStep({ tasksRepository });
      const r = await step({ id: "non-existent" });
      expect(r.type).toBe("err");
      if (r.type === "err") {
        expect(r.value).toBe("NotFound");
      }
    });

    test("err: Unexpected when transition is invalid", async () => {
      const mockJob = {
        id: "job-123",
        status: "queued" as const,
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
      const step = makeMarkProcessingStep({ tasksRepository });
      const r = await step({ id: "job-123" });
      expect(r.type).toBe("err");
      if (r.type === "err") {
        expect(r.value).toBe("Unexpected");
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
        markProcessing: async () => {
          throw new Error("DB error");
        },
        markDone: async () => null,
        countDone: async () => 0,
      };
      const step = makeMarkProcessingStep({ tasksRepository });
      const r = await step({ id: "job-123" });
      expect(r.type).toBe("err");
      if (r.type === "err") {
        expect(r.value).toBe("Unexpected");
      }
    });
  });

  describe("makeMarkDoneStep", () => {
    test("ok: marks job as done", async () => {
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
      const step = makeMarkDoneStep({ tasksRepository });
      const r = await step({
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
      const step = makeMarkDoneStep({ tasksRepository });
      const r = await step({
        id: "non-existent",
        result: {
          message: "Task completed",
          finishedAt: "2024-01-01T01:00:00Z",
        },
      });
      expect(r.type).toBe("err");
      if (r.type === "err") {
        expect(r.value).toBe("NotFound");
      }
    });

    test("err: Unexpected when transition is invalid", async () => {
      const mockJob = {
        id: "job-123",
        status: "processing" as const,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };
      const tasksRepository: TasksRepository = {
        createJob: async () => mockJob,
        getJob: async () => null,
        markProcessing: async () => null,
        markDone: async () => mockJob,
        countDone: async () => 0,
      };
      const step = makeMarkDoneStep({ tasksRepository });
      const r = await step({
        id: "job-123",
        result: {
          message: "Task completed",
          finishedAt: "2024-01-01T01:00:00Z",
        },
      });
      expect(r.type).toBe("err");
      if (r.type === "err") {
        expect(r.value).toBe("Unexpected");
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
        markDone: async () => {
          throw new Error("DB error");
        },
        countDone: async () => 0,
      };
      const step = makeMarkDoneStep({ tasksRepository });
      const r = await step({
        id: "job-123",
        result: {
          message: "Task completed",
          finishedAt: "2024-01-01T01:00:00Z",
        },
      });
      expect(r.type).toBe("err");
      if (r.type === "err") {
        expect(r.value).toBe("Unexpected");
      }
    });
  });
});
