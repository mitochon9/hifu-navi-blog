import { z } from "zod";

// Cloud Run が空文字で環境変数を注入するケースに対応するため、
// 空文字/未設定を指定のデフォルト URL に置き換えてから URL 検証を行う
const urlWithDefault = (defaultUrl: string) =>
  z.preprocess((v) => {
    if (typeof v !== "string" || v.trim() === "") {
      return defaultUrl;
    }
    return v;
  }, z.url());

const ConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_PRETTY: z.string().optional(),
  CORS_ORIGIN: z.string().default("*"),
  PORT: z.coerce.number().default(8080),

  WORKER_BASE_URL: urlWithDefault("http://localhost:8081"),
  SERVER_INTERNAL_URL: urlWithDefault("http://localhost:8080"),

  // Worker SAのemail（OIDC検証用）
  WORKER_SA_EMAIL: z.email().optional(),

  CLOUD_TASKS_PROJECT_ID: z.string().optional(),
  CLOUD_TASKS_LOCATION: z.string().optional(),
  CLOUD_TASKS_QUEUE: z.string().optional(),
  CLOUD_TASKS_SA_EMAIL: z.email().optional(),
});

export type AppConfig = {
  nodeEnv: "development" | "test" | "production";
  logPretty?: string;
  corsOrigin: string;
  workerBaseUrl: string;
  serverInternalUrl: string;
  workerServiceAccountEmail?: string;
  cloudTasks?: {
    projectId: string;
    location: string;
    queue: string;
    serviceAccountEmail?: string;
  };
  port: number;
};

export function loadConfig(): AppConfig {
  const parsed = ConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    process.exit(1);
  }
  const base = parsed.data;

  // 本番では誤設定のまま起動させない
  const rawWorkerBaseUrl = process.env.WORKER_BASE_URL;
  if (base.NODE_ENV === "production") {
    if (!rawWorkerBaseUrl || rawWorkerBaseUrl.trim() === "") {
      process.exit(1);
    }
  }
  const cloudTasks =
    base.CLOUD_TASKS_PROJECT_ID && base.CLOUD_TASKS_LOCATION && base.CLOUD_TASKS_QUEUE
      ? {
          projectId: base.CLOUD_TASKS_PROJECT_ID,
          location: base.CLOUD_TASKS_LOCATION,
          queue: base.CLOUD_TASKS_QUEUE,
          serviceAccountEmail: base.CLOUD_TASKS_SA_EMAIL,
        }
      : undefined;

  return {
    nodeEnv: base.NODE_ENV,
    logPretty: base.LOG_PRETTY,
    corsOrigin: base.CORS_ORIGIN,
    workerBaseUrl: base.WORKER_BASE_URL,
    serverInternalUrl: base.SERVER_INTERNAL_URL,
    workerServiceAccountEmail: base.WORKER_SA_EMAIL,
    cloudTasks,
    port: base.PORT,
  };
}
