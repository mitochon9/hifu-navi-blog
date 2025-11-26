import type { Env, Hono, Schema } from "hono";
import type { hc } from "hono/client";

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type ApiClientOptions = {
  fetch?: FetchLike;
  getHeaders?:
    | Record<string, string>
    | (() => Record<string, string> | Promise<Record<string, string>>);
  onRequestStart?: (info: { url: string; method?: string }) => void;
  onResponseEnd?: (info: {
    url: string;
    method?: string;
    status: number;
    durationMs: number;
  }) => void;
  timeoutMs?: number;
  retry?: {
    retries: number;
    retryOn?: (res: Response | undefined, err: unknown, attempt: number) => boolean;
    backoffMs?: (attempt: number) => number;
  };
};

// hc の戻り値型を参照するためのヘルパー型
// hc の型定義は T extends Hono を要求するが、実行時にはより柔軟な型も受け入れる
// apps/server-node/src/public.ts では ReturnType<typeof hc<AppType>> が動作している
// App が Hono の制約を満たす場合はそのまま使い、満たさない場合は
// factory.ts の型アサーションにより実際の型情報が保持される
export type ApiOf<App> = App extends Hono<Env, Schema, string>
  ? ReturnType<typeof hc<App>>
  : ReturnType<typeof hc<Hono<Env, Schema, string>>>;
