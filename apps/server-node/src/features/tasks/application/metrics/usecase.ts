import { flow, type Result } from "@repo/result";
import type { TasksRepository } from "../../domain/tasks.repository";
import { makeCountDoneStep } from "./steps";

type GetMetricsInput = null;
type GetMetricsError = "Unexpected";
type GetMetricsOutput = Result<{ totalDone: number }, GetMetricsError>;

export function makeGetMetrics(deps: { tasksRepository: TasksRepository }) {
  const { tasksRepository } = deps;
  const countDoneStep = makeCountDoneStep({ tasksRepository });
  return async function getMetrics(_: GetMetricsInput): Promise<GetMetricsOutput> {
    return flow<GetMetricsInput, GetMetricsError>(null).asyncAndThen(countDoneStep).value();
  };
}
