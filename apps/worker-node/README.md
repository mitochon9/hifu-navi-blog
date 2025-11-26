# apps/worker-node

Cloud Tasks からの呼び出しを処理する Worker アプリケーション。

## 概要

- **技術スタック**: Hono, Cloud Tasks
- **役割**: バックグラウンド処理（非同期タスク、バッチ処理）
- **認証**: Cloud Tasks からの OIDC 認証（`ax-tasks-invoker-sa` のみ許可）

## 起動

```sh
cd apps/worker-node
bun run dev
# http://localhost:8081
```

## アーキテクチャ

### アクセス制御

- **ingress**: `INGRESS_TRAFFIC_ALL`（外部からのアクセスを許可、ただし認証必須）
- **認証**: `run.invoker` 権限を持つサービスアカウント（`ax-tasks-invoker-sa`）からの OIDC トークンを検証

### ディレクトリ構造

```
src/
├── features/           # 機能単位（tasks など）
│   └── tasks/
│       ├── domain/     # ドメインロジック（バリデーションなど）
│       └── application/# ユースケース
├── routes/             # エンドポイント定義
├── middlewares/        # ミドルウェア（OIDC検証など）
└── index.ts            # エントリーポイント
```

## Cloud Tasks 連携

Server からエンキューされたタスクを処理します。

1. **Server**: `CloudTasksClient` を使用してタスクをエンキュー（OIDC トークン設定）
2. **Cloud Tasks**: Worker のエンドポイント（例: `/tasks/enqueue`）に HTTP リクエスト（OIDC トークン付き）
3. **Worker**: OIDC トークンを検証し、処理を実行
4. **Worker**: 処理状況を Server にコールバック（`/tasks/callback/*`）

詳細は [開発ガイド - Worker](../../docs/development.md#worker) を参照してください。

## 開発

### ローカル開発

ローカル環境では、Cloud Tasks エミュレータや直接の HTTP リクエストでテストできます。

```sh
# タスク処理のテスト（直接呼び出し）
curl -X POST http://localhost:8081/tasks/enqueue \
  -H "Content-Type: application/json" \
  -d '{"jobId": "test-job", "callbackUrl": "http://localhost:8080/api/tasks/callback"}'
```

**注意**: ローカル開発環境（`NODE_ENV=development`）では、OIDC トークンの検証はスキップされる場合があります（ミドルウェアの実装による）。

### コマンド

```sh
bun run lint       # Biome
bun run typecheck  # TypeScript
bun run test       # テスト実行
```

