import { err, isOk, ok, type Result } from "@repo/result";
import type { User } from "../../domain/models";
import type { UsersRepository } from "../../domain/users.repository";
import type { CreateUserInput } from "./validators";

// 入出力型（ファイルローカル）
type CreateUserStepInput = CreateUserInput;
// 変更: ドメインモデル (User) をそのまま返すようにする
type CreateUserStepOutput = Result<User, "Conflict" | "Unexpected">;

export function makeCreateUserStep(deps: { usersRepository: UsersRepository }) {
  const { usersRepository } = deps;
  return async function createUserStep(i: CreateUserStepInput): Promise<CreateUserStepOutput> {
    const created = await usersRepository.create(i);
    if (isOk(created)) {
      // リポジトリは既に User を返しているのでそのまま返す
      return ok(created.value);
    }
    if (created.value === "Conflict") {
      return err("Conflict");
    }
    return err("Unexpected");
  };
}
