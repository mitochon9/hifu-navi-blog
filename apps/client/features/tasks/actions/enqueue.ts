"use server";

import type { EnqueueTaskResponse } from "@repo/contracts";
import { err, ok, type Result } from "@repo/result";
import { api } from "@/shared/lib/api";

export async function enqueueTask(): Promise<Result<{ jobId: string }, "Unexpected">> {
  try {
    const res = await api.tasks.enqueue.$post();
    if (!res.ok) {
      return err("Unexpected");
    }
    const body = (await res.json()) as EnqueueTaskResponse;
    return ok({ jobId: body.jobId });
  } catch {
    return err("Unexpected");
  }
}
