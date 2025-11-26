import { flow, type Result } from "@repo/result";
import { makeDelayStep, makeNotifyDoneStep, makeNotifyProcessingStep } from "./steps";
import { type ProcessTaskInput, validateProcessTaskInput } from "./validators";

type ProcessError = "Invalid" | "Unexpected";

export function makeProcessTask(deps: {
  notifyProcessing: (callbackUrl: string, jobId: string) => Promise<void>;
  notifyDone: (
    callbackUrl: string,
    payload: { jobId: string; message: string; finishedAt: string }
  ) => Promise<void>;
  delayMs: (ms: number) => Promise<void>;
}) {
  const { notifyProcessing, notifyDone, delayMs } = deps;
  const notifyProcessingStep = makeNotifyProcessingStep({ notifyProcessing });
  const delayStep = makeDelayStep({ delayMs, ms: 3_000 });
  const notifyDoneStep = makeNotifyDoneStep({ notifyDone });
  return async function processTask(input: ProcessTaskInput): Promise<Result<null, ProcessError>> {
    return flow<ProcessTaskInput, ProcessError>(input)
      .andThen(validateProcessTaskInput)
      .asyncAndThen(notifyProcessingStep)
      .asyncAndThen(delayStep)
      .asyncAndThen(notifyDoneStep)
      .value();
  };
}
