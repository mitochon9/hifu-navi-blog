import type { Result } from "@repo/result";
import type { User } from "./models";

export type { User };

export type UsersRepository = {
  list(): Promise<User[]>;
  create(input: {
    email: string;
    name: string | null;
  }): Promise<Result<User, "Conflict" | "Unexpected">>;
  getById(id: number): Promise<User | null>;
};
