import { flow, type Result } from "@repo/result";
import type { TasksRepository } from "../../domain/tasks.repository";
import type { TaskDispatcher } from "../ports";
import { makeCreateJobStep, makeDispatchWorkerStep } from "./steps";

type EnqueueInput = { callbackUrl: string };
type EnqueueError = "Invalid" | "Unexpected";
type EnqueueOutput = Result<{ jobId: string }, EnqueueError>;

export function makeEnqueueTask(deps: {
  tasksRepository: TasksRepository;
  dispatcher: TaskDispatcher;
  callbackBaseUrl: string;
}) {
  const { tasksRepository, dispatcher, callbackBaseUrl } = deps;
  return async function enqueue(): Promise<EnqueueOutput> {
    const createJobStep = makeCreateJobStep({ tasksRepository });
    const dispatchWorkerStep = makeDispatchWorkerStep({ dispatcher });
    return flow<EnqueueInput, EnqueueError>({
      callbackUrl: `${callbackBaseUrl}/api/tasks/callback`,
    })
      .asyncAndThen(createJobStep)
      .asyncAndThen(dispatchWorkerStep)
      .value();
  };
}
