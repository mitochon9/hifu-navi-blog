import { createMiddleware } from "@repo/server-kit";
import type { Context, Next } from "hono";
import { verifyOidcToken } from "../integrations/google-auth";

/**
 * Google Cloud OIDCトークンを検証するミドルウェア
 * Cloud Runサービス間認証で使用されるOIDCトークンを検証します
 */
export function createVerifyOidcMiddleware(config: {
  allowedServiceAccountEmails: string[];
  expectedAudience: string;
  nodeEnv: string;
  skipInDevelopment?: boolean;
}) {
  const {
    allowedServiceAccountEmails,
    expectedAudience,
    nodeEnv,
    skipInDevelopment = true,
  } = config;

  return createMiddleware(async (c: Context, next: Next) => {
    // 開発環境ではスキップ
    if (skipInDevelopment && nodeEnv !== "production") {
      await next();
      return;
    }

    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized: Missing or invalid Authorization header" }, 401);
    }

    const token = authHeader.substring(7);

    const result = await verifyOidcToken({
      idToken: token,
      expectedAudience,
      allowedServiceAccountEmails,
    });

    if (!result.valid) {
      const statusCode = result.error.includes("Invalid service account") ? 403 : 401;
      return c.json(
        {
          error: "Unauthorized",
          detail: result.error,
        },
        statusCode
      );
    }

    // コンテキストに認証情報を保存（必要に応じて）
    c.set("authenticatedServiceAccount", result.email);

    await next();
  });
}
