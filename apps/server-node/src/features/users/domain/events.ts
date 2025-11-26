import { type UsersCreatedEvent, UsersCreatedEventSchema } from "@repo/contracts";
import { err, ok, type Result } from "@repo/result";
import type { User } from "./models";

export function createUsersCreatedEvent(
  user: User,
  occurredAt: string = new Date().toISOString()
): Result<UsersCreatedEvent, "InvalidEvent"> {
  const parsed = UsersCreatedEventSchema.safeParse({
    type: "users/created",
    payload: {
      ...user,
      occurredAt,
    },
  });

  if (!parsed.success) {
    return err("InvalidEvent");
  }

  return ok(parsed.data);
}
