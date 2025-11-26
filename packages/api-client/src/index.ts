/*
  目的: API クライアントのファサード。アプリ側は直接 `hono/client` を import せず、
  常に `@repo/api-client` 経由で利用する。削除すると呼び出し元が壊れるため保持する。

  将来の拡張ポイント:
  - クライアント生成/設定の集中管理（baseURL, ヘッダ, タイムアウト, リトライ）
  - 監視/トレーシング/ロギングの注入（fetch ラッパ、計測、相関 ID）
  - 認証ヘッダや署名/CSRF の付与など共通前処理
  - エラー形式の正規化や後方互換マッピング
  - ランタイムバリデーション層の追加（contracts 変更吸収のバッファ）
  - テスト/Storybook 用のモック差し替え

  例: 将来的に `createApiClient()` を追加し、共通オプションを受け取る実装に差し替え可能。
*/

export { hc } from "hono/client";
export { createApiClient } from "./factory";
export type { ApiClientOptions, ApiOf } from "./types";
