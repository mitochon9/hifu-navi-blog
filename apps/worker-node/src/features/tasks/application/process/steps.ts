import { err, ok, type Result } from "@repo/result";
import type { ProcessTaskInput } from "./validators";

type NotifyProcessingStepInput = ProcessTaskInput;
type NotifyProcessingStepOutput = Result<NotifyProcessingStepInput, "Unexpected">;

export function makeNotifyProcessingStep(deps: {
  notifyProcessing: (callbackUrl: string, jobId: string) => Promise<void>;
}) {
  const { notifyProcessing } = deps;
  return async function notifyProcessingStep(
    i: NotifyProcessingStepInput
  ): Promise<NotifyProcessingStepOutput> {
    try {
      await notifyProcessing(i.callbackUrl, i.jobId);
      return ok(i);
    } catch {
      // processing通知の失敗は致命ではないため、そのまま次へ
      return ok(i);
    }
  };
}

type DelayStepInput = ProcessTaskInput;
type DelayStepOutput = Result<DelayStepInput, "Unexpected">;

export function makeDelayStep(deps: { delayMs: (ms: number) => Promise<void>; ms?: number }) {
  const { delayMs, ms = 3_000 } = deps;

  return async function delayStep(i: DelayStepInput): Promise<DelayStepOutput> {
    try {
      await delayMs(ms);
      return ok(i);
    } catch {
      return err("Unexpected");
    }
  };
}

type NotifyDoneStepInput = ProcessTaskInput;
type NotifyDoneStepOutput = Result<null, "Unexpected">;

export function makeNotifyDoneStep(deps: {
  notifyDone: (
    callbackUrl: string,
    payload: { jobId: string; message: string; finishedAt: string }
  ) => Promise<void>;
}) {
  const { notifyDone } = deps;
  return async function notifyDoneStep(i: NotifyDoneStepInput): Promise<NotifyDoneStepOutput> {
    try {
      await notifyDone(i.callbackUrl, {
        jobId: i.jobId,
        message: "サンプル処理が完了しました",
        finishedAt: new Date().toISOString(),
      });
      return ok(null);
    } catch {
      return err("Unexpected");
    }
  };
}
