import type { Result } from "@repo/result";

/**
 * タスクのドメインルールを検証する
 * ドメイン不変条件をチェック（現在は特に不変条件なし）
 * 特定の入力DTOには依存せず、必要なデータのみを受け取る
 */
export function validateTaskInvariants(
  _jobId: string,
  _callbackUrl: string
): Result<null, "Invalid"> {
  // 現在はドメイン不変条件がないため、常に成功
  // 将来的に不変条件が追加された場合はここでチェック
  return { type: "ok", value: null };
}
