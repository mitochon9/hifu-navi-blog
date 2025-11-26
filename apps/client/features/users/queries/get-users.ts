import type { UsersListResponse } from "@repo/contracts";
import { api, baseUrl } from "@/shared/lib/api";

const CACHE_TAG = "users:list";

export async function getUsers(): Promise<UsersListResponse["items"]> {
  try {
    const res = await api.users.$get({
      fetch: {
        next: {
          revalidate: 30,
          tags: [CACHE_TAG],
        },
      },
    });
    if (!res.ok) {
      console.error(`[getUsers] API request failed: ${res.status} (baseUrl: ${baseUrl})`);
      throw new Error(`Failed to fetch users: ${res.status}`);
    }
    const json = (await res.json()) as UsersListResponse;
    return Array.isArray(json.items) ? json.items : [];
  } catch (error) {
    console.error(`[getUsers] Error:`, error, `(baseUrl: ${baseUrl})`);
    throw error;
  }
}
