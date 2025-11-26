import { z } from "zod";

export const EnqueueTaskResponseSchema = z.object({
  jobId: z.string(),
});
export type EnqueueTaskResponse = z.infer<typeof EnqueueTaskResponseSchema>;

export const TaskStatusResponseSchema = z.object({
  id: z.string(),
  status: z.enum(["queued", "processing", "done"]),
  result: z
    .object({
      message: z.string(),
      finishedAt: z.string(),
    })
    .optional(),
});
export type TaskStatusResponse = z.infer<typeof TaskStatusResponseSchema>;

export const TaskMetricsResponseSchema = z.object({
  totalDone: z.number().int().nonnegative(),
});
export type TaskMetricsResponse = z.infer<typeof TaskMetricsResponseSchema>;
