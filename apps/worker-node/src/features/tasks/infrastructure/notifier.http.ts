import { getIdToken } from "../../../shared/auth";
import type { TasksNotifierPort } from "../domain/notifier.port";

export function createHttpNotifier(deps: {
  fetchFn?: typeof fetch;
  nodeEnv: string;
}): TasksNotifierPort {
  const { fetchFn = fetch, nodeEnv } = deps;
  async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * callbackUrlからベースURL（スキーム＋ホスト）を抽出
   * OIDCトークンのaudienceはベースURLである必要がある
   */
  function extractBaseUrl(callbackUrl: string): string {
    try {
      const url = new URL(callbackUrl);
      return `${url.protocol}//${url.host}`;
    } catch {
      // URL解析に失敗した場合、そのまま返す（後でエラーになる）
      return callbackUrl;
    }
  }

  async function requestWithRetry(
    url: string,
    json: unknown,
    opts?: { maxRetries?: number; timeoutMs?: number }
  ): Promise<void> {
    const maxRetries = opts?.maxRetries ?? 3;
    const timeoutMs = opts?.timeoutMs ?? 1500;

    // Cloud Runサービス間認証用のOIDCトークンを取得
    // audienceはベースURL（callbackUrlから抽出）
    let idToken: string | undefined;
    try {
      // callbackUrlからベースURLを抽出してaudienceとして使用
      const callbackUrl = url.replace(/\/processing$|\/done$/, "");
      const audience = extractBaseUrl(callbackUrl);
      idToken = await getIdToken(audience, nodeEnv);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // 本番環境ではトークン取得失敗は致命的エラー
      if (nodeEnv === "production") {
        console.error(
          JSON.stringify({
            error: "Failed to acquire OIDC token for callback",
            evt: "callback_token_error",
            mod: "tasks",
            url,
            errorMessage,
          })
        );
        throw error instanceof Error ? error : new Error(String(error));
      }
      // 開発環境では警告のみ
      console.error(
        JSON.stringify({
          evt: "requestWithRetry_idtoken_error",
          mod: "tasks",
          url,
          error: errorMessage,
          note: "Continuing without token (development only)",
        })
      );
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (idToken) {
          headers.Authorization = `Bearer ${idToken}`;
        }
        const res = await fetchFn(url, {
          method: "POST",
          headers,
          body: JSON.stringify(json),
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!res.ok) {
          const errorText = await res.text().catch(() => "Failed to read error");
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        return;
      } catch (e) {
        if (attempt === maxRetries) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          const errorName = e instanceof Error ? e.name : undefined;
          const errorStack = e instanceof Error ? e.stack : undefined;
          // HTTPコンテキスト外ではloggerが使えないため、console.errorを使用（Cloud Runの標準出力としてログに記録される）
          console.error(
            JSON.stringify({
              error: "Failed to send callback after retries",
              evt: "callback_error",
              mod: "tasks",
              url,
              attempt: maxRetries,
              errorName,
              message: errorMessage,
              stack: errorStack,
            })
          );
          throw e instanceof Error ? e : new Error(String(e));
        }
        const backoff = 200 * 2 ** (attempt - 1);
        await sleep(backoff);
      }
    }
  }

  return {
    async notifyProcessing(callbackUrl, jobId) {
      await requestWithRetry(`${callbackUrl}/processing`, { jobId });
    },
    async notifyDone(callbackUrl, payload) {
      await requestWithRetry(`${callbackUrl}/done`, payload);
    },
  };
}
