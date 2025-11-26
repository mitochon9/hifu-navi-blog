import { err, isOk, ok, type Result } from "@repo/result";
import { toCompletedTransition, toProcessingTransition } from "../../domain/state-machine";
import type { TaskResult, TasksRepository } from "../../domain/tasks.repository";

type MarkProcessingStepInput = { id: string };
type MarkProcessingStepOutput = Result<{ id: string; status: string }, "NotFound" | "Unexpected">;

export function makeMarkProcessingStep(deps: { tasksRepository: TasksRepository }) {
  const { tasksRepository } = deps;
  return async function markProcessingStep(
    i: MarkProcessingStepInput
  ): Promise<MarkProcessingStepOutput> {
    try {
      const job = await tasksRepository.markProcessing(i.id);
      if (!job) {
        return err("NotFound");
      }
      const transition = toProcessingTransition({ job });
      if (!isOk(transition)) {
        return err("Unexpected");
      }
      return ok({ id: transition.value.job.id, status: transition.value.job.status });
    } catch {
      return err("Unexpected");
    }
  };
}

type MarkDoneStepInput = { id: string; result: TaskResult };
type MarkDoneStepOutput = Result<{ id: string; status: string }, "NotFound" | "Unexpected">;

export function makeMarkDoneStep(deps: { tasksRepository: TasksRepository }) {
  const { tasksRepository } = deps;
  return async function markDoneStep(i: MarkDoneStepInput): Promise<MarkDoneStepOutput> {
    try {
      const job = await tasksRepository.markDone(i.id, i.result);
      if (!job) {
        return err("NotFound");
      }
      const transition = toCompletedTransition({ job });
      if (!isOk(transition)) {
        return err("Unexpected");
      }
      return ok({ id: transition.value.job.id, status: transition.value.job.status });
    } catch {
      return err("Unexpected");
    }
  };
}
