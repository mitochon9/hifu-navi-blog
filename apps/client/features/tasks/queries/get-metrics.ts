"use server";

import type { TaskMetricsResponse } from "@repo/contracts";
import { api, baseUrl } from "@/shared/lib/api";

const CACHE_TAG = "tasks:metrics";

export async function getTaskMetrics(): Promise<
  { ok: true; data: TaskMetricsResponse } | { ok: false }
> {
  try {
    const res = await api.tasks.metrics.$get({
      fetch: {
        next: {
          revalidate: 30,
          tags: [CACHE_TAG],
        },
      },
    });
    if (!res.ok) {
      console.error(`[getTaskMetrics] API request failed: ${res.status} (baseUrl: ${baseUrl})`);
      return { ok: false };
    }
    const data = (await res.json()) as TaskMetricsResponse;
    return { ok: true, data };
  } catch (error) {
    console.error(`[getTaskMetrics] Error:`, error, `(baseUrl: ${baseUrl})`);
    throw error;
  }
}
