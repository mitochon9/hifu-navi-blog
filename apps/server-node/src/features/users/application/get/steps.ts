import { err, ok, type Result } from "@repo/result";
import type { User } from "../../domain/models";
import type { UsersRepository } from "../../domain/users.repository";

// 入出力型（ファイルローカル）
type GetUserStepInput = number;
// 変更: ドメインモデル (User) をそのまま返す
type GetUserStepOutput = Result<User, "NotFound">;

export function makeGetUserStep(deps: { usersRepository: UsersRepository }) {
  const { usersRepository } = deps;
  return async function getUserStep(userId: GetUserStepInput): Promise<GetUserStepOutput> {
    const user = await usersRepository.getById(userId);
    return user ? ok(user) : err("NotFound");
  };
}
