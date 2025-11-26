import { describe, expect, test } from "bun:test";
import {
  createEnqueueCommand,
  toCompletedTransition,
  toProcessingTransition,
} from "./state-machine";
import type { Job } from "./tasks.repository";

describe("tasks.domain state-machine", () => {
  describe("createEnqueueCommand", () => {
    test("ok: creates valid command", () => {
      const r = createEnqueueCommand({
        jobId: "job-123",
        callbackUrl: "https://example.com/callback",
      });
      expect(r.type).toBe("ok");
      if (r.type === "ok") {
        expect(r.value.type).toBe("tasks/enqueue");
        expect(r.value.payload.jobId).toBe("job-123");
        expect(r.value.payload.callbackUrl).toBe("https://example.com/callback");
        expect(r.value.issuedAt).toBeDefined();
      }
    });

    test("ok: uses default issuedAt when not provided", () => {
      const r = createEnqueueCommand({
        jobId: "job-123",
        callbackUrl: "https://example.com/callback",
      });
      expect(r.type).toBe("ok");
      if (r.type === "ok") {
        expect(r.value.issuedAt).toBeDefined();
        expect(typeof r.value.issuedAt).toBe("string");
      }
    });

    test("ok: uses provided issuedAt", () => {
      const issuedAt = "2024-01-01T00:00:00Z";
      const r = createEnqueueCommand({
        jobId: "job-123",
        callbackUrl: "https://example.com/callback",
        issuedAt,
      });
      expect(r.type).toBe("ok");
      if (r.type === "ok") {
        expect(r.value.issuedAt).toBe(issuedAt);
      }
    });

    test("err: InvalidCommand when payload is invalid", () => {
      const r = createEnqueueCommand({
        jobId: "",
        callbackUrl: "",
      });
      expect(r.type).toBe("err");
      if (r.type === "err") {
        expect(r.value).toBe("InvalidCommand");
      }
    });
  });

  describe("toProcessingTransition", () => {
    test("ok: creates transition for processing job", () => {
      const job: Job = {
        id: "job-123",
        status: "processing",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };
      const r = toProcessingTransition({ job });
      expect(r.type).toBe("ok");
      if (r.type === "ok") {
        expect(r.value.job.id).toBe("job-123");
        expect(r.value.job.status).toBe("processing");
        expect(r.value.event.type).toBe("tasks/processing");
        expect(r.value.event.payload.jobId).toBe("job-123");
      }
    });

    test("err: InvalidTransition when job status is not processing", () => {
      const job: Job = {
        id: "job-123",
        status: "queued",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };
      const r = toProcessingTransition({ job });
      expect(r.type).toBe("err");
      if (r.type === "err") {
        expect(r.value).toBe("InvalidTransition");
      }
    });

    test("ok: uses default occurredAt when not provided", () => {
      const job: Job = {
        id: "job-123",
        status: "processing",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };
      const r = toProcessingTransition({ job });
      expect(r.type).toBe("ok");
      if (r.type === "ok") {
        expect(r.value.event.payload.occurredAt).toBeDefined();
        expect(typeof r.value.event.payload.occurredAt).toBe("string");
      }
    });

    test("ok: uses provided occurredAt", () => {
      const occurredAt = "2024-01-01T01:00:00Z";
      const job: Job = {
        id: "job-123",
        status: "processing",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };
      const r = toProcessingTransition({ job, occurredAt });
      expect(r.type).toBe("ok");
      if (r.type === "ok") {
        expect(r.value.event.payload.occurredAt).toBe(occurredAt);
      }
    });
  });

  describe("toCompletedTransition", () => {
    test("ok: creates transition for completed job", () => {
      const job: Job = {
        id: "job-123",
        status: "done",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        result: {
          message: "Task completed",
          finishedAt: "2024-01-01T01:00:00Z",
        },
      };
      const r = toCompletedTransition({ job });
      expect(r.type).toBe("ok");
      if (r.type === "ok") {
        expect(r.value.job.id).toBe("job-123");
        expect(r.value.job.status).toBe("done");
        expect(r.value.event.type).toBe("tasks/completed");
        expect(r.value.event.payload.jobId).toBe("job-123");
        expect(r.value.event.payload.message).toBe("Task completed");
        expect(r.value.event.payload.finishedAt).toBe("2024-01-01T01:00:00Z");
      }
    });

    test("err: InvalidTransition when job status is not done", () => {
      const job: Job = {
        id: "job-123",
        status: "processing",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };
      const r = toCompletedTransition({ job });
      expect(r.type).toBe("err");
      if (r.type === "err") {
        expect(r.value).toBe("InvalidTransition");
      }
    });

    test("err: InvalidTransition when job result is missing", () => {
      const job: Job = {
        id: "job-123",
        status: "done",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };
      const r = toCompletedTransition({ job });
      expect(r.type).toBe("err");
      if (r.type === "err") {
        expect(r.value).toBe("InvalidTransition");
      }
    });

    test("ok: uses default occurredAt when not provided", () => {
      const job: Job = {
        id: "job-123",
        status: "done",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        result: {
          message: "Task completed",
          finishedAt: "2024-01-01T01:00:00Z",
        },
      };
      const r = toCompletedTransition({ job });
      expect(r.type).toBe("ok");
      if (r.type === "ok") {
        expect(r.value.event.payload.occurredAt).toBeDefined();
        expect(typeof r.value.event.payload.occurredAt).toBe("string");
      }
    });

    test("ok: uses provided occurredAt", () => {
      const occurredAt = "2024-01-01T02:00:00Z";
      const job: Job = {
        id: "job-123",
        status: "done",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        result: {
          message: "Task completed",
          finishedAt: "2024-01-01T01:00:00Z",
        },
      };
      const r = toCompletedTransition({ job, occurredAt });
      expect(r.type).toBe("ok");
      if (r.type === "ok") {
        expect(r.value.event.payload.occurredAt).toBe(occurredAt);
      }
    });
  });
});
