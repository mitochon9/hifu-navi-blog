import { CreateUserRequestSchema } from "@repo/contracts";
import { err, isOk, ok, type Result } from "@repo/result";
import { makeEmail, makeUserName } from "../../domain/models";

export type CreateUserInput = { email: string; name: string | null };

/**
 * ユーザー作成入力をバリデーションする
 * 契約スキーマとドメイン不変条件の両方をチェック
 */
export function validateCreateUser(input: CreateUserInput): Result<CreateUserInput, "Invalid"> {
  const parsed = CreateUserRequestSchema.safeParse(input);
  if (!parsed.success) {
    return err("Invalid");
  }

  // ドメインルールのチェック
  const emailResult = makeEmail(parsed.data.email);
  if (!isOk(emailResult)) {
    return err("Invalid");
  }

  const nameResult = makeUserName(parsed.data.name);
  if (!isOk(nameResult)) {
    return err("Invalid");
  }

  return ok({ email: parsed.data.email, name: parsed.data.name });
}
