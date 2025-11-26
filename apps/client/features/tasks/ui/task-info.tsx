"use client";

type TaskResult = {
  message: string;
  finishedAt: string;
};

type TaskInfoProps = {
  totalDone: number | null;
  status: string | null;
  result: TaskResult | null;
  error: string | null;
};

export function TaskInfo({ totalDone, status, result, error }: TaskInfoProps) {
  return (
    <>
      <div className="text-sm text-zinc-700 dark:text-zinc-300">
        累計完了タスク数: <span className="font-medium">{totalDone ?? "-"}</span>
      </div>
      {error ? <div className="text-sm text-red-600 dark:text-red-400">{error}</div> : null}
      {status ? (
        <div className="text-sm">
          <div>
            Status: <span className="font-medium">{status}</span>
          </div>
        </div>
      ) : null}
      {result ? (
        <div className="text-sm">
          <div className="font-medium">Result</div>
          <div className="text-zinc-800 dark:text-zinc-100">{result.message}</div>
          <div className="text-zinc-600 dark:text-zinc-400">finishedAt: {result.finishedAt}</div>
        </div>
      ) : null}
    </>
  );
}
