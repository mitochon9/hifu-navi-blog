"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseClipboardOptions = {
  timeoutMs?: number;
};

export function useClipboard({ timeoutMs = 1500 }: UseClipboardOptions = {}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => setCopied(false), timeoutMs);
        return true;
      } catch {
        return false;
      }
    },
    [timeoutMs]
  );

  return { copied, copy } as const;
}
