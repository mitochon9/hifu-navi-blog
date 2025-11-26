import type { User } from "@features/users/domain/models";

// レスポンス用のDTO型定義
type UserDto = {
  id: number;
  email: string;
  name: string | null;
};

export function toListUsersResponse(users: User[]): { items: UserDto[] } {
  return {
    items: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
    })),
  };
}
