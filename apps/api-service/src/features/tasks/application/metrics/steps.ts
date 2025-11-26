import { err, ok, type Result } from "@repo/result";
import type { TasksRepository } from "../../domain/tasks.repository";

type CountDoneStepInput = null;
type CountDoneStepOutput = Result<{ totalDone: number }, "Unexpected">;

export function makeCountDoneStep(deps: { tasksRepository: TasksRepository }) {
  const { tasksRepository } = deps;
  return async function countDoneStep(_: CountDoneStepInput): Promise<CountDoneStepOutput> {
    try {
      const totalDone = await tasksRepository.countDone();
      return ok({ totalDone });
    } catch {
      return err("Unexpected");
    }
  };
}
