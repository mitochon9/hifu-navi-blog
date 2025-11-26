import type { z } from "zod";

type ValidationSuccess<T> = { success: true; data: T };
type ValidationFailure = { success: false; errors: string[] };

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

function normalizeFormData(formData: FormData): Record<string, string> {
  const entries: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      if (!(key in entries)) {
        entries[key] = value;
      }
      return;
    }
    if (!(key in entries)) {
      entries[key] = value.name;
    }
  });
  return entries;
}

function toErrorMessages(issues: z.ZodError["issues"]): string[] {
  return issues.map((issue) => issue.message);
}

export function validateFormData<T extends z.ZodTypeAny>(
  schema: T,
  formData: FormData
): ValidationResult<z.infer<T>> {
  const candidate = Object.fromEntries(
    Object.entries(normalizeFormData(formData)).map(([key, value]) => [key, value])
  );
  const parsed = schema.safeParse(candidate);
  if (!parsed.success) {
    return {
      success: false,
      errors: toErrorMessages(parsed.error.issues),
    };
  }
  return {
    success: true,
    data: parsed.data,
  };
}

/**
 * Next.js API RoutesでJSONリクエストをバリデーションする関数
 *
 * 現在のアーキテクチャでは使用していませんが、将来Next.jsのAPI Routes
 * (app/api/.../route.ts) を使用する場合に備えて残しています。
 *
 * 使用例: app/api/users/route.ts で POST ハンドラー内で使用
 */
export async function validateJsonRequest<T extends z.ZodTypeAny>(
  schema: T,
  request: Request
): Promise<ValidationResult<z.infer<T>>> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return {
      success: false,
      errors: ["Invalid JSON body"],
    };
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      errors: toErrorMessages(parsed.error.issues),
    };
  }
  return {
    success: true,
    data: parsed.data,
  };
}
