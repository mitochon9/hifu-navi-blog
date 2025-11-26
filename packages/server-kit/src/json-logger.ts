import type { Context, Next } from "hono";
import { createMiddleware } from "./factory.js";
import type { ReqLogger } from "./types.js";

type LogLevel = "info" | "error";
type LogSink = (entry: Record<string, unknown>, level: LogLevel) => void;

type LevelDeciderInput = {
  status: number;
  phase: "success" | "error";
};

type TransformInput = {
  entry: Record<string, unknown>;
  level: LogLevel;
  phase: "success" | "error";
};

export type JsonLoggerOptions = {
  sink?: LogSink;
  includeUserAgent?: boolean;
  includeIp?: boolean;
  /**
   * ログに `evt` フィールドを含めたい場合に指定します。
   * 文字列を渡すとその値を `evt` に設定、`false` を渡すと出力しません。
   */
  eventName?: string | false;
  /**
   * ログに `mod` フィールドを含めたい場合に指定します。
   */
  moduleName?: string;
  levelDecider?: (input: LevelDeciderInput) => LogLevel;
  transform?: (input: TransformInput) => Record<string, unknown>;
};

const defaultSink: LogSink = (entry, level) => {
  const payload = JSON.stringify(entry);
  if (level === "error") {
    console.error(payload);
    return;
  }
  console.log(payload);
};

const defaultLevelDecider = ({ status }: LevelDeciderInput): LogLevel => {
  if (status >= 500) {
    return "error";
  }
  return "info";
};

const defaultTransform = ({ entry }: TransformInput): Record<string, unknown> => entry;

function toLogEntryBase(params: {
  requestId: unknown;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  userAgent?: string;
  ip?: string;
  options: JsonLoggerOptions;
}) {
  const { requestId, method, path, status, durationMs, userAgent, ip, options } = params;
  const entry: Record<string, unknown> = {
    requestId,
    method,
    path,
    status,
    durationMs,
  };
  if (options.eventName) {
    entry.evt = options.eventName;
  }
  if (options.moduleName) {
    entry.mod = options.moduleName;
  }
  if (options.includeUserAgent && userAgent) {
    entry.userAgent = userAgent;
  }
  if (options.includeIp && ip) {
    entry.ip = ip;
  }
  return entry;
}

function toErrorFields(err: unknown) {
  if (err instanceof Error) {
    return {
      message: err.message,
      stack: err.stack,
    };
  }
  const fallback = String(err);
  return {
    message: fallback,
    stack: undefined,
  };
}

export function jsonLogger(options: JsonLoggerOptions = {}) {
  const {
    sink = defaultSink,
    levelDecider = defaultLevelDecider,
    transform = defaultTransform,
  } = options;
  return createMiddleware(async (c: Context, next: Next) => {
    const start = Date.now();
    const rid = c.get("requestId");
    const { method } = c.req;
    const url = new URL(c.req.url);
    const ua = c.req.header("user-agent");
    const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
    const logger: ReqLogger = {
      info: (entry) => sink({ requestId: rid, ...entry }, "info"),
      error: (entry) => sink({ requestId: rid, ...entry }, "error"),
    };
    c.set("logger", logger);
    try {
      await next();
      const ms = Date.now() - start;
      const status = c.res.status;
      const baseEntry = toLogEntryBase({
        requestId: rid,
        method,
        path: url.pathname,
        status,
        durationMs: ms,
        userAgent: ua,
        ip,
        options,
      });
      const level = levelDecider({ status, phase: "success" });
      const finalEntry = transform({ entry: baseEntry, level, phase: "success" });
      sink(finalEntry, level);
    } catch (err) {
      const ms = Date.now() - start;
      const baseEntry = toLogEntryBase({
        requestId: rid,
        method,
        path: url.pathname,
        status: 500,
        durationMs: ms,
        userAgent: ua,
        ip,
        options,
      });
      const { message, stack } = toErrorFields(err);
      const errorEntry: Record<string, unknown> = {
        ...baseEntry,
        error: message,
      };
      if (stack) {
        errorEntry.errorStack = stack;
      }
      const level = levelDecider({ status: 500, phase: "error" });
      const finalEntry = transform({ entry: errorEntry, level, phase: "error" });
      sink(finalEntry, level);
      throw err;
    }
  });
}
