import type { User } from "@features/users/domain/models";

export function toCreateUserResponse(user: User): { item: { id: number } } {
  return {
    item: { id: user.id },
  };
}
