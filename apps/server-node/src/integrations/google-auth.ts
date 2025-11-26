import { OAuth2Client } from "google-auth-library";

/**
 * Google OIDCトークン検証結果
 */
type VerifyOidcTokenResult = { valid: true; email: string } | { valid: false; error: string };

/**
 * Google OIDCトークンを検証する
 * Cloud Runサービス間認証で使用されるOIDCトークンを検証します
 */
export async function verifyOidcToken(params: {
  idToken: string;
  expectedAudience: string;
  allowedServiceAccountEmails: string[];
}): Promise<VerifyOidcTokenResult> {
  const { idToken, expectedAudience, allowedServiceAccountEmails } = params;
  const client = new OAuth2Client();

  try {
    // Google OIDCトークンを検証
    const ticket = await client.verifyIdToken({
      idToken,
      audience: expectedAudience,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return { valid: false, error: "Invalid token payload" };
    }

    // issuerの検証（Google OIDC）
    if (payload.iss !== "https://accounts.google.com") {
      return { valid: false, error: "Invalid issuer" };
    }

    // サービスアカウントのemailを確認
    const email = payload.email;
    if (!email || !allowedServiceAccountEmails.includes(email)) {
      return {
        valid: false,
        error: `Invalid service account. Expected one of: ${allowedServiceAccountEmails.join(", ")}`,
      };
    }

    return { valid: true, email };
  } catch (error) {
    return {
      valid: false,
      error: `Token verification failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
