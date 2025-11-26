export type JobStatus = "queued" | "processing" | "done";

export type TaskResult = {
  message: string;
  finishedAt: string;
};

export type Job = {
  id: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  result?: TaskResult;
};

export type TasksRepository = {
  createJob(): Promise<Job>;
  getJob(id: string): Promise<Job | null>;
  markProcessing(id: string): Promise<Job | null>;
  markDone(id: string, result: TaskResult): Promise<Job | null>;
  countDone(): Promise<number>;
};
