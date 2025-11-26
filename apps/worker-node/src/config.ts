import { z } from "zod";

const ConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_PRETTY: z.string().optional(),
  PORT: z.coerce.number().default(8081),
});

export type AppConfig = {
  nodeEnv: "development" | "test" | "production";
  logPretty?: string;
  port: number;
};

export function loadConfig(): AppConfig {
  const parsed = ConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error);
    process.exit(1);
  }
  const base = parsed.data;
  return {
    nodeEnv: base.NODE_ENV,
    logPretty: base.LOG_PRETTY,
    port: base.PORT,
  };
}
