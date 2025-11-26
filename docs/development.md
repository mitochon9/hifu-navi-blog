# 開発ガイド

このドキュメントでは、ax-saas-template の各アプリケーション・パッケージの開発方法について説明します。

## 目次

- [Client](#client)
- [Server](#server)
- [Worker](#worker)
- [DB](#db)
- [パッケージ](#パッケージ)
- [開発時のコマンド](#開発時のコマンド)

## Client

### 概要

Next.js (App Router) を使用したフロントエンドアプリケーション。Feature-Sliced Design (FSD) アーキテクチャを採用しています。

詳細は [apps/client/README.md](../apps/client/README.md) を参照してください。

### FSD（Feature-Sliced Design）構造

クライアントアプリケーションは FSD アーキテクチャに基づいて構成されています。

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

#### レイヤー規則

- **features**: 機能単位のスライス。`actions`、`queries`、`ui` に分割
- **widgets**: 複数の features を組み合わせた複合的な UI ブロック
- **shared**: 横断関心（config, api, lib, utils, styles）を配置
- **components**: 汎用的な UI コンポーネント（shadcn/ui など）

#### 依存関係ルール

- `shared` から `features` への参照は禁止（dependency-cruiser で検証）
- `features` 間の直接参照は警告（必要に応じて `widgets` 経由）
- 型付き API クライアントは `shared/lib/api.ts` で一元管理

### Next.js Cache API / Partial Prerendering

- `app/page.tsx` は `revalidate = 30` と `experimental_ppr = true` を指定しており、Partial Prerendering による初期レスポンス高速化と、Cache API による増分再検証を併用します。
- `features/tasks/queries/get-metrics.ts` では `unstable_cache`（Cache API）を利用してメトリクス取得をキャッシュし、`tasks:metrics` タグで無効化可能です。

### Server Actions / Request API の型検証ユーティリティ

- `shared/lib/request-validation.ts` に `validateFormData` / `validateJsonRequest` を追加しました。
- `createUserAction` などの Server Action は Zod によるバリデーション + `@repo/contracts` のスキーマで入力を正規化します。
- API Route を実装する際も `validateJsonRequest` を利用することで、Server Action と同じエラー整形・再利用が可能です。

### shadcn/ui

UI コンポーネントは shadcn/ui をベースにしています。

- コンポーネントは `apps/client/components/ui/` に配置
- `components.json` で設定を管理
- 用途により未使用エクスポートがありえるため、knip 除外方針に準拠（`knip.json` で除外設定）

使用方法:

```bash
cd apps/client
npx shadcn@latest add button
```

### RPC（型付きAPIクライアント）

クライアントとサーバー間の通信は、Hono の RPC 機能を使用した型付き API クライアントで実現しています。

#### 仕組み

1. **contracts** (`packages/contracts`): API コントラクトと型定義を共有
2. **api-client** (`packages/api-client`): Hono の `hc` を使用した型付きクライアントファクトリ
3. **サーバー側**: Hono アプリケーションの型を `@server/public` からエクスポート
   - Server の型定義は `bun run types` で生成され、`dist-types/public.d.ts` に出力されます
   - Client の `tsconfig.json` で `@server/public` パスエイリアスが設定されています
   - Client の `predev`/`pretypecheck`/`prebuild` フックで自動的に型生成が実行されます

#### 使用例

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

**型安全性**:
- API エンドポイントの型が自動推論される
- リクエスト/レスポンスの型が一致しない場合はコンパイルエラー
- エンドポイントの追加・変更は型システムで検出可能

詳細は [apps/client/README.md](../apps/client/README.md) を参照してください。

## Server

### 概要

Hono を使用した REST API サーバー。クリーンアーキテクチャと Result 指向（ROP）設計を採用しています。

詳細は [apps/server-node/README.md](../apps/server-node/README.md) を参照してください。

### Hono フレームワーク

Hono は軽量で高速な Web フレームワークです。

- ルーティング: `routes/` 配下で定義
- バリデーション: `zValidator` で zod スキーマを使用
- ミドルウェア: `middlewares/` 配下で定義（request-id, cors, logging など）
- ルータ: RegExpRouter を採用
- 観測ログ: `createHttpLogger` ミドルウェアが requestId / method / path / status / durationMs を構造化 JSON で出力し、追加フィールドやログレベルはオプションで切り替えられます

### RPC（型共有）

サーバー側の型をクライアントと共有するため、Hono の RPC 機能を使用しています。

```typescript
// apps/server-node/src/public.ts
import type { AppType } from "./types";

export type AppType = AppType;

// apps/client から参照
import type { AppType } from "@server/public";
```

**型生成のプロセス**:
- Server の型定義は `tsconfig.types.json` を使用して `dist-types/public.d.ts` に生成されます
- `bun run types` コマンドで型定義を生成できます
- Client の `predev`/`pretypecheck`/`prebuild` フックで自動的に型生成が実行されます
- Client の `tsconfig.json` で `@server/public` パスエイリアスが `../server-node/dist-types/public.d.ts` に設定されています

これにより、クライアント側で型安全な API 呼び出しが可能になります。

### DDD/クリーンアーキテクチャ

サーバーアプリケーションはクリーンアーキテクチャに基づいて構成されています。

```
apps/server-node/src/
├── routes/                 # HTTP I/O とバリデーション
├── features/               # 機能単位
│   └── users/
│       ├── application/    # ユースケース・ステップ
│       │   ├── create/
│       │   │   ├── steps.ts       # ステップ関数
│       │   │   └── usecase.ts    # ユースケース（チェイン）
│       ├── domain/         # ドメインモデル・リポジトリ抽象
│       └── infrastructure/ # リポジトリ実装
├── integrations/          # 外部SDKの薄いラッパー
└── container.ts           # DI コンテナ
```

#### 層の責務

- **routes**: HTTP I/O とバリデーションのみ。service を呼び出す
- **application**: ユースケース/ステップ。外部I/Fはポート（interface/type）のみ依存
- **domain**: ドメインモデル/リポジトリ抽象
- **infrastructure**: リポジトリ実装/外部サービスアダプタ
- **integrations**: 外部SDKの薄いラッパー（GCP等）

ドメイン層では DMMF 成果物に沿ってイベント/コマンドの型定義を扱います。

- `features/users/domain/users.repository.ts` でドメイン不変条件の検証を行います。
- `features/tasks/domain/state-machine.ts` で `TasksEnqueueCommandSchema` / `TasksProcessingEventSchema` / `TasksCompletedEventSchema` の遷移判定を行います。

#### 依存の向き

```
routes → application → (domain | ports) → infrastructure → integrations
```

逆向きは禁止（dependency-cruiser で検査）。

### 型安全性と型アサーション

TypeScriptの型安全性を維持するため、型アサーション（`as`キャスト）の使用は原則禁止です。

#### 禁止事項

- **安易な`as`キャスト**: 型エラーを回避するために`as`を使うことは禁止
- **`as any`**: 型チェックを完全に回避するため、使用禁止
- **`as unknown as Type`**: 型安全性を損なうため、使用禁止

#### 推奨される代替手段

1. **型ガード関数**: 実行時バリデーションと型の絞り込みを同時に行う
   ```typescript
   function isValidJobStatus(value: string): value is JobStatus {
     return value === "queued" || value === "processing" || value === "done";
   }
   
   if (!isValidJobStatus(row.status)) {
     throw new Error(`Invalid job status: ${row.status}`);
   }
   // ここでrow.statusはJobStatus型に絞り込まれている
   ```

2. **型定義の修正**: 型定義を修正して正しい型推論を実現する
3. **ジェネリクス**: 型パラメータを活用して型安全性を保つ

#### 許容される例外的なケース

以下のケースでは`as`キャストの使用が許容されます:

- `as const`: リテラル型の固定（例: `status: 404 as const`）
- `import { X as Y }`: 名前の変更（例: `import { prisma as prismaClient }`）
- テストコードでの`as unknown`: 型チェックを回避する必要がある場合
- 型生成専用ファイルでの`as never`: 型生成のためのダミー値
- エラーハンドリングでの型ガード: `typeof`チェックと組み合わせて使用（例: `e as { code?: string }`）

詳細は`.cursor/rules/typescript-style.mdc`を参照してください。

#### Result 型

```typescript
type Result<T, E> = Ok<T> | Err<E>;
```

- `Ok<T>`: 成功時の値
- `Err<E>`: 失敗時のエラー（文字列リテラルのユニオン）

#### ステップ関数

ファイル先頭に入出力の型エイリアスを置く（ファイルローカル）:

```typescript
type CreateUserStepInput = CreateUserInput;
type CreateUserStepOutput = Result<{ item: { id: number } }, "Conflict" | "Unexpected">;

export function makeCreateUserStep(deps: { usersRepository: UsersRepository }) {
  const { usersRepository } = deps;
  return async function createUserStep(i: CreateUserStepInput): Promise<CreateUserStepOutput> {
    const created = await usersRepository.create(i);
    if (isOk(created)) {
      return ok({ item: { id: created.value.id } });
    }
    if (created.value === "Conflict") {
      return err("Conflict");
    }
    return err("Unexpected");
  };
}
```

#### ユースケース（チェイン）

`flow` を使用してステップをチェイン:

```typescript
type CreateUserError = "Conflict" | "Invalid" | "Unexpected";

export function makeCreateUser(deps: { usersRepository: UsersRepository }) {
  const createUserStep = makeCreateUserStep(deps);
  return async function createUser(
    input: CreateUserInput
  ): Promise<Result<{ item: { id: number } }, CreateUserError>> {
    return flow<CreateUserInput, CreateUserError>(input)
      .andThen(validateCreateUser)
      .asyncAndThen(createUserStep)
      .value();
  };
}
```

- `andThen`: 同期的な Result 変換
- `asyncAndThen`: 非同期的な Result 変換
- `value()`: 最終的な Result を取得

詳細は [apps/server-node/README.md](../apps/server-node/README.md) を参照してください。

### 外部SDK/integrations層

外部SDKは必ず`src/integrations/`配下に配置します。

- `@google-cloud/*`、`google-auth-library`、その他の外部サービスSDKは直接使用せず、`integrations`層にラッパー関数として実装
- `middlewares`、`routes`、`features`層から外部SDKを直接importしない
- `integrations`層は外部SDKの薄いラッパーとして、アプリケーション固有の型やエラーハンドリングを提供する

実装例:
- `src/integrations/cloud-tasks.ts`: Google Cloud Tasks SDKのラッパー
- `src/integrations/google-auth.ts`: Google OIDC認証SDKのラッパー

詳細は [apps/server-node/README.md](../apps/server-node/README.md#外部sdkintegrations) を参照してください。

## Worker

### 概要

バックグラウンド処理を実行するワーカーアプリケーション。Cloud Tasks から OIDC 認証で呼び出されます。

### Cloud Tasks連携

Server が Cloud Tasks にタスクをエンキューし、Worker が処理を実行します。

#### Server側（エンキュー）

```typescript
// apps/server-node/src/integrations/cloud-tasks.ts
import { enqueueHttpTask } from "./integrations/cloud-tasks";

await enqueueHttpTask({
  projectId: "your-project-id",
  location: "asia-northeast1",
  queueName: "ax-tasks-queue",
  url: workerUrl,
  serviceAccountEmail: "ax-tasks-invoker-sa@...",
  body: { jobId, callbackUrl },
});
```

#### Worker側（処理）

```typescript
// apps/worker-node/src/routes/tasks/index.ts
export function createTasksRouter(container: { tasks: TasksWorkerService }) {
  const app = new Hono().post("/enqueue", async (c) => {
    const { jobId, callbackUrl } = c.req.valid("json");
    await container.tasks.processTask({ jobId, callbackUrl });
    return c.json({ ok: true });
  });
  return app;
}
```

### OIDC認証

Worker は Cloud Tasks からの OIDC 認証を受け付けます。

- Cloud Tasks が OIDC トークン付きで Worker を呼び出し
- Worker の ingress 設定は `INGRESS_TRAFFIC_ALL`（認証必須）
- `ax-tasks-invoker-sa` のみ `run.invoker` 権限あり

詳細は [システムアーキテクチャ](architecture.md#認証認可) を参照してください。

## DB

### 概要

Prisma を使用したデータベース管理。PostgreSQL を想定しています。

### データベースの立ち上げ

開発環境では Docker Compose を使用して PostgreSQL を起動します。

```bash
# 本番/テストDBを起動
bun run db:up:all

# 本番DBのみ起動
bun run db:up

# テストDBのみ起動
bun run db:up:test
```

Docker Compose の設定:
- 本番DB: ポート `5432`、データベース名 `app_db`、ユーザー名 `postgres`、パスワード `postgres`
- テストDB: ポート `5433`、データベース名 `app_db`、ユーザー名 `postgres`、パスワード `postgres`

**注意**: 開発環境では `postgres` ユーザーを使用しますが、本番環境では `appuser` ユーザーを使用します。

### マイグレーション

```bash
# 開発用マイグレーション（スキーマ変更を反映）
bun run db:migrate

# Prisma Client 生成
bun run db:generate
```

**注意**: `db:migrate` は `--skip-generate` フラグを使用しているため、Prisma Client の生成は `db:generate` で別途実行する必要があります。

### Prisma Studio

データベースの内容を確認するには Prisma Studio を使用します。

```bash
bun run db:studio
```

### Prisma の使用方法

`packages/database` パッケージから Prisma Client をインポートして使用します。

```typescript
import { prisma } from "@repo/db";

// 使用例
const users = await prisma.user.findMany();
```

詳細は [packages/database](../packages/database/README.md) を参照してください。

## パッケージ

### client/admin-client で共有

以下のパッケージは client と admin-client（将来追加）で共有できます。

- **`@repo/ui`**: 共有 UI コンポーネント（React コンポーネント）
- **`@repo/api-client`**: 型付き API クライアント（Hono RPC クライアント）
- **`@repo/contracts`**: API コントラクト/型（クライアント・サーバー間で共有）

### server/worker で共有

以下のパッケージは server と worker で共有できます。

- **`@repo/server-kit`**: サーバ共通ユーティリティ（DI/ロガ/タイミング）
- **`@repo/database`**: Prisma スキーマ/操作ラッパ
- **`@repo/result`**: Result 型ユーティリティ
- **`@repo/contracts`**: API コントラクト/型（クライアント・サーバー間で共有）

### その他のパッケージ

- **`@repo/typescript-config`**: TypeScript 設定の共有
- **`@repo/tailwind-config`**: Tailwind CSS 設定の共有

### パッケージ詳細

#### `@repo/database`

Prisma スキーマとクライアントのラッパー。

- **スキーマ**: `packages/database/prisma/schema.prisma`
- **エクスポート**: `prisma` インスタンスと Prisma 型
- **使用例**:
  ```typescript
  import { prisma, type User } from "@repo/db";
  
  const users = await prisma.user.findMany();
  ```

#### `@repo/result`

Result 型ユーティリティ（ROP パターン用）。

- **エクスポート**: `Result<T, E>`, `ok()`, `err()`, `isOk()`, `flow()`
- **使用例**:
  ```typescript
  import { ok, err, flow } from "@repo/result";
  
  const result = flow(input)
    .andThen(validate)
    .asyncAndThen(process)
    .value();
  ```

詳細は各パッケージの `package.json` と `src/index.ts` を参照してください。

## 開発時のコマンド

### knip（未使用コード検出）

未使用のコードや依存関係を検出します。

```bash
# 未使用コードの検出
bun run knip

# 自動修正（削除）
bun run knip:fix
```

設定は `knip.json` で管理。shadcn 配下の UI コンポーネントは未使用エクスポート/型を除外。

詳細は [開発コマンド詳細](dev-commands.md) を参照してください。

### madge（依存関係分析）

依存関係の循環や孤立ファイルを検出します。

```bash
# 循環依存の検出
bun run dep:cycles

# 孤立ファイル/依存の検出
bun run dep:orphans

# 依存グラフの生成
bun run dep:graph
```

### steiger（FSD検証）

Feature-Sliced Design のルールを検証します。

```bash
bun run arch:fsd
```

設定は `steiger.config.mjs` で管理。FSD の推奨設定を使用。

### depcruise（依存ルール検証）

クリーンアーキテクチャの依存ルールを検証します。

```bash
bun run arch:dc
```

設定は `dependency-cruiser.config.cjs` で管理。

### 手作りスクリプト

#### sync-main

`origin/main` へ追従（rebase 既定、DB/型チェックまで自動）。

```bash
bun run sync-main
```

#### check-all

Lint/Type/Test/Architecture を差分限定で一括実行。

```bash
bun run check-all
```

#### arch-guards

構文/配置ガード（export */class/interface 禁止、層間依存や env 参照のガード 等）。

```bash
bun run arch:guards
```

#### arch:check

アーキ規約（依存・FSD・knip）一式を実行。

```bash
bun run arch:check
```

### Hono ドキュメント閲覧

Hono の公式ドキュメントを閲覧・検索できます。

```bash
cd apps/server-node

# ドキュメント閲覧
bunx hono docs

# ドキュメント検索
bunx hono search middleware --pretty
```

| コマンド | 目的 | 備考 |
| --- | --- | --- |
| `bunx hono docs` | ドキュメント閲覧 | `bunx hono docs /docs/guides/basics` など |
| `bunx hono search <query>` | ドキュメント検索 | `--pretty` で整形表示 |

## 環境変数

### 開発環境

開発環境では、ルートの `.env` ファイルを使用します（`dotenv -e .env`）。

必須:
- `DATABASE_URL`: データベース接続URL（例: `postgresql://postgres:postgres@localhost:5432/app_db?schema=public`）
- `TEST_DATABASE_URL`: テスト用データベース接続URL（例: `postgresql://postgres:postgres@localhost:5433/app_db?schema=public`）

**注意**: Docker Compose で起動する場合、デフォルトではユーザー名 `postgres`、パスワード `postgres`、データベース名 `app_db` になります。

オプション（各アプリケーション）:
- Server: `PORT`（既定: 8080）, `NODE_ENV`, `CORS_ORIGIN`, `LOG_PRETTY`
- Worker: `PORT`（既定: 8081）, `NODE_ENV`, `LOG_PRETTY`
- Client: `API_BASE_URL`（既定: `http://localhost:8080`）

### 本番環境

本番環境では、Terraform が環境変数を自動設定します。

- Server: `DATABASE_URL`（Secret Manager から）、`WORKER_BASE_URL`、`CLOUD_TASKS_*` など
- Worker: 最小限の環境変数のみ
- Client: `API_BASE_URL`（Cloud Run の直接 URL）

詳細は [README.md](../README.md#環境変数) を参照してください。

## 参照ドキュメント

- [システムアーキテクチャ](architecture.md) - システム全体の構成
- [開発コマンド詳細](dev-commands.md) - よく使うコマンドの詳細説明
- [apps/client/README.md](../apps/client/README.md) - Client 詳細
- [apps/server-node/README.md](../apps/server-node/README.md) - Server 設計ガイド

