import { isOk, type Result } from "@repo/result";

type Status = 200 | 201 | 400 | 404 | 409 | 500;

/**
 * Result型をHTTPレスポンスに変換する
 * @param result Result型の値
 * @param defaultSuccessStatus 成功時のデフォルトHTTPステータス（デフォルト: 200）
 * @returns HTTPステータスとボディのペア
 */
export function toHttp<T, E>(
  result: Result<T, E>,
  defaultSuccessStatus: Status = 200
): { status: Status; body: T | { message: string } } {
  if (isOk(result)) {
    return { status: defaultSuccessStatus, body: result.value };
  }
  const errorValue = result.value;
  if (errorValue === "NotFound") {
    return { status: 404 as const, body: { message: "not found" } };
  }
  if (errorValue === "Conflict") {
    return { status: 409 as const, body: { message: "conflict" } };
  }
  if (errorValue === "Invalid") {
    return { status: 400 as const, body: { message: "invalid" } };
  }
  return { status: 500 as const, body: { message: "unexpected" } };
}
