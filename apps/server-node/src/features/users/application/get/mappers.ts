import type { User } from "@features/users/domain/models";

// レスポンス用のDTO型定義
type UserDto = {
  id: number;
  email: string;
  name: string | null;
};

export function toGetUserResponse(user: User): { item: UserDto } {
  return {
    item: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}
