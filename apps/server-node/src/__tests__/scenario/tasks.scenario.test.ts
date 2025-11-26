import { describe, expect, test } from "bun:test";
import {
  TasksCompletedEventSchema,
  TasksEnqueueCommandSchema,
  TasksProcessingEventSchema,
} from "@repo/contracts";
import { err } from "@repo/result";
import {
  createEnqueueCommand,
  toCompletedTransition,
  toProcessingTransition,
} from "../../features/tasks/domain/state-machine";
import type { Job } from "../../features/tasks/domain/tasks.repository";

describe("scenario: tasks", () => {
  const baseJob: Job = {
    id: "job-1",
    status: "queued",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  test("creates enqueue command with callback url", () => {
    const command = createEnqueueCommand({
      jobId: baseJob.id,
      callbackUrl: "https://example.com/callback",
    });
    expect(command.type).toBe("ok");
    expect(() => TasksEnqueueCommandSchema.parse(command.value)).not.toThrow();
  });

  test("rejects enqueue command without callback url", () => {
    const command = createEnqueueCommand({
      jobId: baseJob.id,
      callbackUrl: "",
    });
    expect(command).toEqual(err("InvalidCommand"));
  });

  test("processing transition validates event payload", () => {
    const job: Job = {
      ...baseJob,
      status: "processing",
    };
    const transition = toProcessingTransition({ job });
    expect(transition.type).toBe("ok");
    if (transition.type === "ok") {
      expect(() => TasksProcessingEventSchema.parse(transition.value.event)).not.toThrow();
    }
  });

  test("completed transition requires result payload", () => {
    const job: Job = {
      ...baseJob,
      status: "done",
      result: {
        message: "done",
        finishedAt: new Date().toISOString(),
      },
    };
    const transition = toCompletedTransition({ job });
    expect(transition.type).toBe("ok");
    if (transition.type === "ok") {
      expect(() => TasksCompletedEventSchema.parse(transition.value.event)).not.toThrow();
    }
  });

  test("completed transition fails without result", () => {
    const job: Job = {
      ...baseJob,
      status: "done",
    };
    const transition = toCompletedTransition({ job });
    expect(transition).toEqual(err("InvalidTransition"));
  });
});
