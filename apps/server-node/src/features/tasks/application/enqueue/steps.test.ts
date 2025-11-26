import { describe, expect, test } from "bun:test";
import { err, ok } from "@repo/result";
import type { TasksRepository } from "../../domain/tasks.repository";
import type { TaskDispatcher } from "../ports";
import { makeCreateJobStep, makeDispatchWorkerStep } from "./steps";

describe("tasks.enqueue steps", () => {
  describe("makeCreateJobStep", () => {
    test("ok: creates job and returns command", async () => {
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
      const step = makeCreateJobStep({ tasksRepository });
      const r = await step({ callbackUrl: "https://example.com/callback" });
      expect(r.type).toBe("ok");
      if (r.type === "ok") {
        expect(r.value.jobId).toBe("job-123");
        expect(r.value.command.type).toBe("tasks/enqueue");
        expect(r.value.command.payload.jobId).toBe("job-123");
        expect(r.value.command.payload.callbackUrl).toBe("https://example.com/callback");
      }
    });

    test("err: Invalid when command creation fails", async () => {
      const mockJob = {
        id: "",
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
      const step = makeCreateJobStep({ tasksRepository });
      const r = await step({ callbackUrl: "" });
      expect(r.type).toBe("err");
      if (r.type === "err") {
        expect(r.value).toBe("Invalid");
      }
    });

    test("err: Unexpected when repository throws", async () => {
      const tasksRepository: TasksRepository = {
        createJob: async () => {
          throw new Error("DB error");
        },
        getJob: async () => null,
        markProcessing: async () => null,
        markDone: async () => null,
        countDone: async () => 0,
      };
      const step = makeCreateJobStep({ tasksRepository });
      const r = await step({ callbackUrl: "https://example.com/callback" });
      expect(r.type).toBe("err");
      if (r.type === "err") {
        expect(r.value).toBe("Unexpected");
      }
    });
  });

  describe("makeDispatchWorkerStep", () => {
    test("ok: dispatches worker successfully", async () => {
      const dispatcher: TaskDispatcher = {
        enqueue: async () => ok(undefined),
      };
      const step = makeDispatchWorkerStep({ dispatcher });
      const r = await step({
        jobId: "job-123",
        command: {
          type: "tasks/enqueue",
          payload: {
            jobId: "job-123",
            callbackUrl: "https://example.com/callback",
          },
          issuedAt: "2024-01-01T00:00:00Z",
        },
      });
      expect(r.type).toBe("ok");
      if (r.type === "ok") {
        expect(r.value.jobId).toBe("job-123");
      }
    });

    test("err: Unexpected when dispatcher returns error", async () => {
      const dispatcher: TaskDispatcher = {
        enqueue: async () => err("Unexpected"),
      };
      const step = makeDispatchWorkerStep({ dispatcher });
      const r = await step({
        jobId: "job-123",
        command: {
          type: "tasks/enqueue",
          payload: {
            jobId: "job-123",
            callbackUrl: "https://example.com/callback",
          },
          issuedAt: "2024-01-01T00:00:00Z",
        },
      });
      expect(r.type).toBe("err");
      if (r.type === "err") {
        expect(r.value).toBe("Unexpected");
      }
    });

    test("err: Unexpected when dispatcher throws", async () => {
      const dispatcher: TaskDispatcher = {
        enqueue: async () => {
          throw new Error("Network error");
        },
      };
      const step = makeDispatchWorkerStep({ dispatcher });
      const r = await step({
        jobId: "job-123",
        command: {
          type: "tasks/enqueue",
          payload: {
            jobId: "job-123",
            callbackUrl: "https://example.com/callback",
          },
          issuedAt: "2024-01-01T00:00:00Z",
        },
      });
      expect(r.type).toBe("err");
      if (r.type === "err") {
        expect(r.value).toBe("Unexpected");
      }
    });
  });
});
