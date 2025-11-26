import { TasksEnqueueCommandSchema } from "@repo/contracts";
import { err, ok, type Result } from "@repo/result";
import { validateTaskInvariants } from "../../domain/tasks.validation";

// ユースケースの入力型は Application 層で定義する
export type ProcessTaskInput = { jobId: string; callbackUrl: string };

/**
 * タスク処理入力をバリデーションする
 * 契約スキーマとドメイン不変条件の両方をチェック
 */
export function validateProcessTaskInput(
  input: ProcessTaskInput
): Result<ProcessTaskInput, "Invalid"> {
  // 契約スキーマでバリデーション
  const parsed = TasksEnqueueCommandSchema.safeParse({
    type: "tasks/enqueue",
    payload: {
      jobId: input.jobId,
      callbackUrl: input.callbackUrl,
    },
    issuedAt: new Date().toISOString(),
  });
  if (!parsed.success) {
    return err("Invalid");
  }

  // ドメイン不変条件をチェック
  // DTO を分解してドメイン関数に渡す
  const domainResult = validateTaskInvariants(
    parsed.data.payload.jobId,
    parsed.data.payload.callbackUrl
  );
  if (domainResult.type === "err") {
    return err("Invalid");
  }

  return ok(input);
}
