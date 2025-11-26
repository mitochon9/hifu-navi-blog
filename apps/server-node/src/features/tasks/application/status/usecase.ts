import { flow, type Result } from "@repo/result";
import type { JobStatus, TasksRepository } from "../../domain/tasks.repository";
import { makeFetchJobStep } from "./steps";

type GetStatusInput = { id: string };
type GetStatusError = "NotFound" | "Unexpected";
type GetStatusOutput = Result<
  {
    id: string;
    status: JobStatus;
    result?: { message: string; finishedAt: string };
  },
  GetStatusError
>;

export function makeGetStatus(deps: { tasksRepository: TasksRepository }) {
  const { tasksRepository } = deps;
  return async function getStatus(i: GetStatusInput): Promise<GetStatusOutput> {
    const fetchJobStep = makeFetchJobStep({ tasksRepository });
    return flow<GetStatusInput, GetStatusError>(i).asyncAndThen(fetchJobStep).value();
  };
}
