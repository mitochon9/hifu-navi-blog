import { createApiClient, type hc } from "@repo/api-client";
import type { AppType } from "@server/public";

const baseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";
// createApiClient の戻り値型が AppType の型情報を保持するように型アサーションを使用
// hc<AppType> の戻り値型を直接参照して型情報を保持
const client = createApiClient<AppType>(baseUrl) as unknown as ReturnType<typeof hc<AppType>>;

// HonoのRPCでは app.route("/api", apiRoutes) により型が api プロパティになるため、
// client.api としてエクスポートして、client.api.users のようにアクセスできるようにする
export const api = client.api;

// baseUrlをエクスポート（エラーログ等で使用）
export { baseUrl };
