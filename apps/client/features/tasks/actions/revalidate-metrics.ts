"use server";

import { updateTag } from "next/cache";

const CACHE_TAG = "tasks:metrics";

export async function revalidateTaskMetrics() {
  // Next.js 16のupdateTagを使用（Server Action内で即座にキャッシュを無効化）
  updateTag(CACHE_TAG);
}
