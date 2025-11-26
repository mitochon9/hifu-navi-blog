"use server";

import type { CreateUserRequest } from "@repo/contracts";
import { CreateUserRequestSchema } from "@repo/contracts";
import { updateTag } from "next/cache";
import { z } from "zod";
import { api } from "@/shared/lib/api";
import { validateFormData } from "@/shared/lib/request-validation";

const CACHE_TAG = "users:list";

export type CreateUserActionState = { ok: true } | { ok: false; message: string };

export async function createUserAction(
  _prev: CreateUserActionState,
  formData: FormData
): Promise<CreateUserActionState> {
  const CreateUserFormSchema = z.object({
    email: z.string(),
    name: z.string().optional(),
  });
  const validation = validateFormData(CreateUserFormSchema, formData);
  if (!validation.success) {
    return { ok: false, message: validation.errors.at(0) ?? "Invalid input" };
  }
  const candidate: CreateUserRequest = {
    email: validation.data.email.trim(),
    name:
      validation.data.name && validation.data.name.trim().length > 0
        ? validation.data.name.trim()
        : null,
  };
  const parsed = CreateUserRequestSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues.at(0)?.message ?? "Invalid input",
    };
  }

  try {
    const res = await api.users.$post({ json: parsed.data });
    if (!res.ok) {
      try {
        const json = (await res.json()) as { message?: string };
        return { ok: false, message: json.message ?? "Failed to create" };
      } catch {
        return { ok: false, message: "Failed to create" };
      }
    }
  } catch {
    return { ok: false, message: "Failed to create" };
  }

  // ユーザーリストのキャッシュを即座に無効化
  updateTag(CACHE_TAG);
  return { ok: true };
}
