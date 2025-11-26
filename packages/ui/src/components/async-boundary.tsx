"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Suspense } from "react";
import { ErrorBoundary } from "./error-boundary";

type AsyncBoundaryProps = {
  children: ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode | ((error: unknown) => React.ReactNode);
  onError?: (error: unknown, info: ErrorInfo) => void;
};

export function AsyncBoundary({
  children,
  fallback = null,
  errorFallback,
  onError,
}: AsyncBoundaryProps) {
  return (
    <ErrorBoundary fallback={errorFallback} onError={onError as (e: unknown, i: ErrorInfo) => void}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
