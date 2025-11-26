import {
  type TasksCompletedEvent,
  TasksCompletedEventSchema,
  type TasksEnqueueCommand,
  TasksEnqueueCommandSchema,
  type TasksProcessingEvent,
  TasksProcessingEventSchema,
} from "@repo/contracts";
import { err, ok, type Result } from "@repo/result";
import type { Job } from "./tasks.repository";

type TransitionPayload<E> = {
  job: Job;
  event: E;
};

export function createEnqueueCommand(input: {
  jobId: string;
  callbackUrl: string;
  issuedAt?: string;
}): Result<TasksEnqueueCommand, "InvalidCommand"> {
  const issuedAt = input.issuedAt ?? new Date().toISOString();
  const parsed = TasksEnqueueCommandSchema.safeParse({
    type: "tasks/enqueue",
    payload: {
      jobId: input.jobId,
      callbackUrl: input.callbackUrl,
    },
    issuedAt,
  });
  if (!parsed.success) {
    return err("InvalidCommand");
  }
  return ok(parsed.data);
}

export function toProcessingTransition(input: {
  job: Job;
  occurredAt?: string;
}): Result<TransitionPayload<TasksProcessingEvent>, "InvalidTransition"> {
  const { job, occurredAt = new Date().toISOString() } = input;
  if (job.status !== "processing") {
    return err("InvalidTransition");
  }
  const parsed = TasksProcessingEventSchema.safeParse({
    type: "tasks/processing",
    payload: {
      jobId: job.id,
      occurredAt,
    },
  });
  if (!parsed.success) {
    return err("InvalidTransition");
  }
  return ok({
    job,
    event: parsed.data,
  });
}

export function toCompletedTransition(input: {
  job: Job;
  occurredAt?: string;
}): Result<TransitionPayload<TasksCompletedEvent>, "InvalidTransition"> {
  const { job, occurredAt = new Date().toISOString() } = input;
  if (job.status !== "done" || !job.result) {
    return err("InvalidTransition");
  }
  const parsed = TasksCompletedEventSchema.safeParse({
    type: "tasks/completed",
    payload: {
      jobId: job.id,
      message: job.result.message,
      finishedAt: job.result.finishedAt,
      occurredAt,
    },
  });
  if (!parsed.success) {
    return err("InvalidTransition");
  }
  return ok({
    job,
    event: parsed.data,
  });
}
