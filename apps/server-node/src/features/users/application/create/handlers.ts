import { createUsersCreatedEvent } from "@features/users/domain/events";
import type { User } from "@features/users/domain/models";
import { isOk } from "@repo/result";

/**
 * ドメインイベントを処理するハンドラ
 *
 * Pub/Subパターンを採用する理由:
 * 1. レスポンス速度の向上: メール送信などの重い処理を非同期化し、ユーザーへのレスポンスをブロックしない
 * 2. 疎結合: 「ユーザー作成」というメイン処理と、「通知・分析」などの付随処理を切り離す
 * 3. 耐障害性: 付随処理が失敗しても、メイン処理（DB保存）には影響を与えず、個別にリトライ可能にする
 */
export function processUserCreatedEvent(user: User): User {
  // ドメインイベント生成（副作用なし、生成のみ確認）
  const eventResult = createUsersCreatedEvent(user);
  if (isOk(eventResult)) {
    // biome-ignore lint/suspicious/noConsole: Domain event logging
    console.info("[DomainEvent] Created:", JSON.stringify(eventResult.value));
    // 将来的にここで EventBus.publish(eventResult.value) などを行う
    // 例: await cloudTasks.enqueue('send-welcome-email', eventResult.value);
  } else {
    // biome-ignore lint/suspicious/noConsole: Domain event logging
    console.error("[DomainEvent] Failed to create event:", eventResult.value);
  }
  return user;
}
