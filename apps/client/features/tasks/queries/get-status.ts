"use server";

import type { TaskStatusResponse } from "@repo/contracts";
import { api, baseUrl } from "@/shared/lib/api";

export async function getTaskStatus(
  id: string
): Promise<{ ok: true; data: TaskStatusResponse } | { ok: false }> {
  try {
    const res = await api.tasks.status[":id"].$get({
      param: { id },
    });
    if (!res.ok) {
      console.error(`[getTaskStatus] API request failed: ${res.status} (baseUrl: ${baseUrl})`);
      return { ok: false };
    }
    const data = (await res.json()) as TaskStatusResponse;
    return { ok: true, data };
  } catch (error) {
    console.error(`[getTaskStatus] Error:`, error, `(baseUrl: ${baseUrl})`);
    return { ok: false };
  }
}
