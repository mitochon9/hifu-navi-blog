import { err, ok, type Result } from "@repo/result";

// ============================================================================
// Value Objects
// ============================================================================

// --- Email ---
export type Email = string & { readonly __brand: "Email" };

export function makeEmail(value: string): Result<Email, "InvalidEmail"> {
  const trimmed = value.trim();
  // 簡易的なメール形式チェック（ドメイン層で外部ライブラリ依存を避けるため）
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return err("InvalidEmail");
  }

  return ok(trimmed as Email);
}

// --- UserName ---
export type UserName = string & { readonly __brand: "UserName" };

export function makeUserName(
  value: string | null | undefined
): Result<UserName | null, "InvalidUserName"> {
  if (value === null || value === undefined) {
    return ok(null);
  }

  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > 100) {
    return err("InvalidUserName");
  }

  return ok(trimmed as UserName);
}

// ============================================================================
// Entities
// ============================================================================

export type User = {
  id: number;
  email: Email;
  name: UserName | null;
};

// DB等の信頼できるソースからの再構築（Reconstitution）用ファクトリ
// バリデーションをスキップして強制的に型を生成します
export function reconstituteUser(data: { id: number; email: string; name: string | null }): User {
  return {
    id: data.id,
    email: data.email as Email,
    name: data.name as UserName | null,
  };
}
