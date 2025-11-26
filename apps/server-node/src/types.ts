import { createApp as createHonoApp } from "@repo/server-kit";
import type { AppConfig } from "./config";
import { composeRoutes } from "./routes/compose";

// 実ルート合成に準拠した公開用の型ソース（型生成専用）。
const app = createHonoApp();
const routes = composeRoutes(app, {} as never, {} as AppConfig);

export type AppType = typeof routes;
