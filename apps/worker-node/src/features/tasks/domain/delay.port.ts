export type DelayPort = {
  delayMs: (ms: number) => Promise<void>;
};
