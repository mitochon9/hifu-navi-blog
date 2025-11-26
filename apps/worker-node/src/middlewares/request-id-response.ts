import { createMiddleware } from "@repo/server-kit";

// 全レスポンスに x-request-id を反映するための軽量ミドルウェア
export const attachResponseRequestId = (headerName: string = "x-request-id") =>
  createMiddleware(async (c, next) => {
    await next();
    const rid = c.get("requestId");
    if (rid) {
      c.res.headers.set(headerName, String(rid));
    }
  });
