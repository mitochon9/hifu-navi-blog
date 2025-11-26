import { type JsonLoggerOptions, jsonLogger } from "./json-logger.js";

type Environment = "development" | "test" | "production" | (string & {});

export type CreateHttpLoggerOptions = {
  environment: Environment;
  includeUserAgent?: JsonLoggerOptions["includeUserAgent"];
  includeIp?: JsonLoggerOptions["includeIp"];
  eventName?: JsonLoggerOptions["eventName"];
  moduleName?: JsonLoggerOptions["moduleName"];
  sink?: JsonLoggerOptions["sink"];
  levelDecider?: JsonLoggerOptions["levelDecider"];
  transform?: JsonLoggerOptions["transform"];
  /**
   * 本番環境で errorStack をログから削除したい場合に使用します。
   * デフォルトは true。
   */
  removeErrorStackInProduction?: boolean;
};

export function createHttpLogger(options: CreateHttpLoggerOptions) {
  const {
    environment,
    includeUserAgent,
    includeIp,
    eventName,
    moduleName,
    sink,
    levelDecider,
    transform,
    removeErrorStackInProduction = true,
  } = options;

  const shouldRemoveStack = removeErrorStackInProduction && environment === "production";

  const resolvedLevelDecider: NonNullable<JsonLoggerOptions["levelDecider"]> =
    levelDecider ??
    (({ status }) => {
      if (status >= 400) {
        return "error";
      }
      return "info";
    });

  const resolvedTransform: NonNullable<JsonLoggerOptions["transform"]> = (input) => {
    const { phase } = input;
    let currentEntry = input.entry;
    if (phase === "error" && shouldRemoveStack && "errorStack" in currentEntry) {
      const sanitized = { ...currentEntry };
      delete sanitized.errorStack;
      currentEntry = sanitized;
    }
    if (!transform) {
      return currentEntry;
    }
    return transform({ ...input, entry: currentEntry });
  };

  const jsonLoggerOptions: JsonLoggerOptions = {
    includeUserAgent,
    includeIp,
    eventName,
    moduleName,
    sink,
    levelDecider: resolvedLevelDecider,
    transform: resolvedTransform,
  };

  return jsonLogger(jsonLoggerOptions);
}
