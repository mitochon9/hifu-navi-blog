import type { ClientRequestOptions } from "hono/client";
import { buildFetch } from "./internal/fetch";
import type { ApiClientOptions, ApiOf } from "./types";

export function createApiClient<App>(baseUrl: string, options?: ApiClientOptions): ApiOf<App> {
  const { hc } = require("hono/client") as typeof import("hono/client");
  const fetchImpl = buildFetch(options);
  // hc は T extends Hono を要求するが、実際にはより柔軟な型も受け入れる
  // そのため、型アサーションを使用して hc の型制約を回避し、ApiOf<App> に変換する
  // App の型情報を保持するため、hc を型アサーションで変換してから呼び出す
  const hcTyped = hc as unknown as <T>(baseUrl: string, options?: ClientRequestOptions) => ApiOf<T>;
  const result = options
    ? hcTyped<App>(baseUrl, { fetch: fetchImpl as typeof fetch })
    : hcTyped<App>(baseUrl);
  return result;
}
