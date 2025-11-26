import { createFactory } from "hono/factory";
import type { ReqLogger } from "./types.js";

export type AppEnv = {
  Variables: {
    requestId: string;
    logger: ReqLogger;
  };
};

const factory = createFactory<AppEnv>();

// 明示的な型注釈で d.ts 生成時の TS2742 を回避
export const createApp: typeof factory.createApp = factory.createApp;
export const createMiddleware: typeof factory.createMiddleware =
  factory.createMiddleware;
