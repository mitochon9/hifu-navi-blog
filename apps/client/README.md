# apps/client

Next.js (App Router) フロントエンドアプリケーション。

## 起動

```sh
bun run dev
# http://localhost:3000
```

## 依存関係

- `@repo/ui`: 共有UI（peer: react/react-dom）
- `@repo/api-client`: 型付きAPIクライアント
- `@repo/db`: Prismaモデル（必要に応じて）

## スタイル

- Tailwind v4（`@tailwindcss/postcss`）
- 共有スタイルは`@repo/ui`参照

## FSD（Feature-Sliced Design）構造

クライアントアプリケーションは Feature-Sliced Design (FSD) アーキテクチャに基づいて構成されています。

```
apps/client/
├── app/                    # Next.js App Router（pages）
├── features/               # 機能単位のスライス
│   ├── users/
│   │   ├── actions/        # Server Actions
│   │   ├── queries/        # データ取得ロジック
│   │   ├── ui/             # UI コンポーネント
│   │   └── index.ts        # パブリック API
│   └── tasks/
├── widgets/                # 複合的な UI ブロック
├── shared/                 # 共有レイヤ（横断関心）
│   └── lib/
│       └── api.ts          # API クライアント設定
└── components/            # 汎用 UI コンポーネント
    └── ui/                 # shadcn/ui コンポーネント
```

### レイヤー規則

- **features**: 機能単位のスライス。`actions`、`queries`、`ui` に分割
- **widgets**: 複数の features を組み合わせた複合的な UI ブロック
- **shared**: 横断関心（config, api, lib, utils, styles）を配置
- **components**: 汎用的な UI コンポーネント（shadcn/ui など）

### 依存関係ルール

- `shared` から `features` への参照は禁止（dependency-cruiser で検証）
- `features` 間の直接参照は警告（必要に応じて `widgets` 経由）
- 型付き API クライアントは `shared/lib/api.ts` で一元管理

詳細は [開発ガイド - Client](../../docs/development.md#client) を参照してください。

## shadcn/ui

UI コンポーネントは shadcn/ui をベースにしています。

### 使用方法

コンポーネントを追加する場合:

```bash
cd apps/client
npx shadcn@latest add button
```

### 設定

- コンポーネントは `apps/client/components/ui/` に配置
- `components.json` で設定を管理
- 用途により未使用エクスポートがありえるため、knip 除外方針に準拠（`knip.json` で除外設定）

## RPC（型付きAPIクライアント）

クライアントとサーバー間の通信は、Hono の RPC 機能を使用した型付き API クライアントで実現しています。

### 仕組み

1. **contracts** (`packages/contracts`): API コントラクトと型定義を共有
2. **api-client** (`packages/api-client`): Hono の `hc` を使用した型付きクライアントファクトリ
3. **サーバー側**: Hono アプリケーションの型を `@server/public` からエクスポート

### 使用例

```typescript
// apps/client/shared/lib/api.ts
import { createApiClient } from "@repo/api-client";
import type { AppType } from "@server/public";

const baseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";
export const api = createApiClient<AppType>(baseUrl);

// apps/client/features/users/queries/get-users.ts
import { api } from "@/shared/lib/api";

export async function getUsers() {
  const res = await api.users.$get();
  if (!res.ok) {
    return [];
  }
  const json = await res.json();
  return json.items;
}
```

### 型安全性

- API エンドポイントの型が自動推論される
- リクエスト/レスポンスの型が一致しない場合はコンパイルエラー
- エンドポイントの追加・変更は型システムで検出可能

詳細は [開発ガイド - RPC](../../docs/development.md#rpctyped-api-client) を参照してください。

## 品質チェック（推奨）

```sh
bun run lint       # Biome
bun run typecheck  # TypeScript
bun run dep:cycles # 依存循環チェック（madge）
bun run dep:orphans# 孤立依存チェック（madge）
```

## 実装方針

- サーバー呼び出しは`@repo/api-client`経由（`apps/client/shared/lib/api.ts`）
- サーバー専用コードは`"use client"`を付けないファイルへ配置
- shadcn系コンポーネントは用途により未使用エクスポートがありえるため、knip除外方針に準拠

詳細は [開発ガイド](../../docs/development.md#client) を参照してください。
