"use client";

import type { ErrorInfo, ReactNode } from "react";
import type { FallbackProps } from "react-error-boundary";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode | ((error: unknown) => ReactNode);
  onError?: (error: unknown, info: { componentStack: string }) => void;
};

export function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  const fallbackRender = (props: FallbackProps) => {
    if (typeof fallback === "function") {
      return (fallback as (e: unknown) => ReactNode)(props.error);
    }
    if (fallback) {
      return fallback;
    }
    return null;
  };

  return (
    <ReactErrorBoundary
      fallbackRender={fallbackRender}
      onError={(error: Error, info: ErrorInfo) =>
        onError?.(error, { componentStack: info.componentStack ?? "" })
      }
    >
      {children}
    </ReactErrorBoundary>
  );
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  type NamedComponent = { displayName?: string; name?: string };
  const componentName =
    (Component as unknown as NamedComponent).displayName ??
    (Component as unknown as NamedComponent).name ??
    "Component";

  const Wrapped = (props: P) => (
    <ErrorBoundary {...boundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  Wrapped.displayName = `WithErrorBoundary(${componentName})`;
  return Wrapped;
}
