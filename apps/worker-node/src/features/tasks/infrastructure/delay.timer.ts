import type { DelayPort } from "../domain/delay.port";

export function createTimerDelay(): DelayPort {
  return {
    delayMs(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  };
}
