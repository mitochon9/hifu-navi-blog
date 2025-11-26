import { hc } from "@repo/api-client";
import type { AppType } from "./types";

// 型専用の公開モジュール。server 実装は型参照のみに留める
export type AppClient = ReturnType<typeof hc<AppType>>;

export const hcWithType = (...args: Parameters<typeof hc>): AppClient => hc<AppType>(...args);

export type { AppType } from "./types";
