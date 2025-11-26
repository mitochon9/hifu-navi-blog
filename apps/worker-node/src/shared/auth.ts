/**
 * Google Cloud Runサービス間認証用のOIDCトークン取得
 * Cloud RunのメタデータサーバーからIDトークンを取得する
 */
export async function getIdToken(
  audience: string,
  nodeEnv: string = "development"
): Promise<string> {
  // Cloud Run環境ではメタデータサーバーからIDトークンを取得
  // ローカル環境では空文字を返す（開発時は認証をスキップ）
  const metadataUrl = `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${encodeURIComponent(audience)}`;

  try {
    const response = await fetch(metadataUrl, {
      headers: {
        "Metadata-Flavor": "Google",
      },
      signal: AbortSignal.timeout(2000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to read error");
      throw new Error(`Failed to get ID token: HTTP ${response.status}: ${errorText}`);
    }

    return await response.text();
  } catch (error) {
    // ローカル環境ではメタデータサーバーが利用できないため、空文字を返す
    // 本番環境ではエラーを再スロー
    if (nodeEnv === "production") {
      throw error instanceof Error ? error : new Error(String(error));
    }
    return "";
  }
}
