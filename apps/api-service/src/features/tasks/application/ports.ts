import type { Result } from "@repo/result";

export type TaskDispatcher = {
  enqueue(input: { jobId: string; callbackUrl: string }): Promise<Result<void, "Unexpected">>;
};
