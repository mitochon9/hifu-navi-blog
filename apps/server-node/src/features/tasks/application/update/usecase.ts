import { flow, type Result } from "@repo/result";
import type { TaskResult, TasksRepository } from "../../domain/tasks.repository";
import { makeMarkDoneStep, makeMarkProcessingStep } from "./steps";

type ProcessingInput = { id: string };
type UpdateError = "NotFound" | "Unexpected";
type UpdateOutput = Result<{ id: string; status: string }, UpdateError>;

export function makeMarkProcessing(deps: { tasksRepository: TasksRepository }) {
  const { tasksRepository } = deps;
  return async function markProcessing(i: ProcessingInput): Promise<UpdateOutput> {
    const markProcessingStep = makeMarkProcessingStep({ tasksRepository });
    return flow<ProcessingInput, UpdateError>(i).asyncAndThen(markProcessingStep).value();
  };
}

type DoneInput = { id: string; result: TaskResult };

export function makeMarkDone(deps: { tasksRepository: TasksRepository }) {
  const { tasksRepository } = deps;
  return async function markDone(i: DoneInput): Promise<UpdateOutput> {
    const markDoneStep = makeMarkDoneStep({ tasksRepository });
    return flow<DoneInput, UpdateError>(i).asyncAndThen(markDoneStep).value();
  };
}
