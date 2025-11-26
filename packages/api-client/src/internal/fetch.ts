import type { ApiClientOptions, FetchLike } from "../types";

function nowMs(): number {
  return typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();
}

function mergeHeaderRecords(
  base: HeadersInit | undefined,
  extra: Record<string, string> | undefined
): HeadersInit | undefined {
  if (!base && !extra) {
    return base;
  }
  const result = new Headers();
  if (base) {
    if (base instanceof Headers) {
      base.forEach((v, k) => {
        result.set(k, v);
      });
    } else if (Array.isArray(base)) {
      for (const [k, v] of base) {
        result.set(k, v);
      }
    } else {
      const record = base as Record<string, unknown>;
      for (const k of Object.keys(record)) {
        const v = record[k];
        if (Array.isArray(v)) {
          result.set(k, v.join(","));
        } else {
          result.set(k, String(v));
        }
      }
    }
  }
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      result.set(k, v);
    }
  }
  return result;
}

function defaultShouldRetry(res: Response | undefined, err: unknown, _attempt: number): boolean {
  if (err) {
    return true;
  }
  if (!res) {
    return false;
  }
  return res.status >= 500;
}

function defaultBackoffMs(attempt: number): number {
  const base = 300 * 2 ** Math.max(0, attempt - 1);
  const jitter = Math.floor(Math.random() * 100);
  return base + jitter;
}

export function buildFetch(options?: ApiClientOptions): FetchLike {
  const baseFetch = options?.fetch ?? fetch;
  if (!options) {
    return baseFetch;
  }

  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : String((input as URL).toString());
    const method = init?.method;

    const headersFromFn =
      typeof options.getHeaders === "function" ? await options.getHeaders() : options.getHeaders;
    const nextInit: RequestInit = {
      ...init,
      headers: mergeHeaderRecords(init?.headers, headersFromFn),
    };

    options.onRequestStart?.({ url, method });

    const totalRetries = options.retry?.retries ?? 0;
    const retryOn = options.retry?.retryOn ?? defaultShouldRetry;
    const backoff = options.retry?.backoffMs ?? defaultBackoffMs;

    let attempt = 0;
    while (true) {
      const startedAt = nowMs();
      let controller: AbortController | undefined;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      if (options.timeoutMs && options.timeoutMs > 0) {
        controller = new AbortController();
        nextInit.signal = controller.signal;
        timeoutId = setTimeout(() => controller?.abort(), options.timeoutMs);
      }
      try {
        const res = await baseFetch(input, nextInit);
        const durationMs = nowMs() - startedAt;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        options.onResponseEnd?.({
          url,
          method,
          status: res.status,
          durationMs,
        });
        if (attempt < totalRetries && retryOn(res, undefined, attempt)) {
          attempt += 1;
          await new Promise((r) => setTimeout(r, backoff(attempt)));
          continue;
        }
        return res;
      } catch (err) {
        const durationMs = nowMs() - startedAt;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        options.onResponseEnd?.({ url, method, status: 0, durationMs });
        if (attempt < totalRetries && retryOn(undefined, err, attempt)) {
          attempt += 1;
          await new Promise((r) => setTimeout(r, backoff(attempt)));
          continue;
        }
        throw err;
      }
    }
  };
}
