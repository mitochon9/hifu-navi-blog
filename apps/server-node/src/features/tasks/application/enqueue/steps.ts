import type { TasksEnqueueCommand } from "@repo/contracts";
import { err, isOk, ok, type Result } from "@repo/result";
import { createEnqueueCommand } from "../../domain/state-machine";
import type { TasksRepository } from "../../domain/tasks.repository";
import type { TaskDispatcher } from "../ports";

type CreateJobStepInput = { callbackUrl: string };
type CreateJobStepOutput = Result<
  { jobId: string; command: TasksEnqueueCommand },
  "Invalid" | "Unexpected"
>;

export function makeCreateJobStep(deps: { tasksRepository: TasksRepository }) {
  const { tasksRepository } = deps;
  return async function createJobStep(i: CreateJobStepInput): Promise<CreateJobStepOutput> {
    try {
      const job = await tasksRepository.createJob();
      const command = createEnqueueCommand({
        jobId: job.id,
        callbackUrl: i.callbackUrl,
      });
      if (!isOk(command)) {
        return err("Invalid");
      }
      return ok({ jobId: job.id, command: command.value });
    } catch {
      return err("Unexpected");
    }
  };
}

type DispatchWorkerStepInput = { jobId: string; command: TasksEnqueueCommand };
type DispatchWorkerStepOutput = Result<{ jobId: string }, "Unexpected">;

export function makeDispatchWorkerStep(deps: { dispatcher: TaskDispatcher }) {
  const { dispatcher } = deps;
  return async function dispatchWorkerStep(
    i: DispatchWorkerStepInput
  ): Promise<DispatchWorkerStepOutput> {
    try {
      const { jobId, callbackUrl } = i.command.payload;
      const res = await dispatcher.enqueue({
        jobId,
        callbackUrl,
      });
      if (res.type === "err") {
        return err("Unexpected");
      }
      return ok({ jobId });
    } catch {
      return err("Unexpected");
    }
  };
}
