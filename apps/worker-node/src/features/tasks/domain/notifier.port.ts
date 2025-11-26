export type TasksNotifierPort = {
  notifyProcessing: (callbackUrl: string, jobId: string) => Promise<void>;
  notifyDone: (
    callbackUrl: string,
    payload: { jobId: string; message: string; finishedAt: string }
  ) => Promise<void>;
};
