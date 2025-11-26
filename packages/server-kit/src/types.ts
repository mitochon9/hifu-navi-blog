export type ReqLogger = {
  info: (e: Record<string, unknown>) => void;
  error: (e: Record<string, unknown>) => void;
};
