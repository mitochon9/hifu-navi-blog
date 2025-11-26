import { z } from "zod";
import type { TaskStatusResponseSchema } from "../http/tasks";

const isoDateTimeSchema = z.iso.datetime({ offset: true });

const taskIdentitySchema = z.object({
  jobId: z.string().min(1).max(36),
});

export const enqueuePayloadSchema = taskIdentitySchema.extend({
  callbackUrl: z.url(),
});

export const TasksEnqueueCommandSchema = z.object({
  type: z.literal("tasks/enqueue"),
  payload: enqueuePayloadSchema,
  issuedAt: isoDateTimeSchema,
});
export type TasksEnqueueCommand = z.infer<typeof TasksEnqueueCommandSchema>;

export const TasksProcessingEventSchema = z.object({
  type: z.literal("tasks/processing"),
  payload: taskIdentitySchema.extend({
    occurredAt: isoDateTimeSchema,
  }),
});
export type TasksProcessingEvent = z.infer<typeof TasksProcessingEventSchema>;

export const TasksCompletedEventSchema = z.object({
  type: z.literal("tasks/completed"),
  payload: taskIdentitySchema.extend({
    message: z.string().min(1),
    finishedAt: isoDateTimeSchema,
    occurredAt: isoDateTimeSchema,
  }),
});
export type TasksCompletedEvent = z.infer<typeof TasksCompletedEventSchema>;

export type TaskStatusEventPayload = z.infer<typeof TaskStatusResponseSchema>;
