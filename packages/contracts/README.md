# @repo/contracts

API コントラクトと共有型定義。

## 概要

- **技術スタック**: Zod
- **役割**: クライアント・サーバー間、およびドメインイベントのインターフェース定義
- **共有**: Client, Server, Worker

## 構成

- `src/http/`: HTTP API のリクエスト/レスポンススキーマ
- `src/events/`: ドメインイベント（Pub/Sub, Cloud Tasks用）のスキーマ

## 使用方法

### HTTP スキーマ

```typescript
import { CreateUserRequestSchema } from "@repo/contracts";

// Server: バリデーション
const body = await c.req.valid("json"); // HonoのzValidatorで使用

// Client: 型推論
type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
```

### イベントスキーマ

```typescript
import { TasksEnqueueCommandSchema } from "@repo/contracts";

// Worker: ペイロード検証
const payload = TasksEnqueueCommandSchema.parse(data);
```

## 開発方針

1. **Single Source of Truth**: API の入出力型はここで定義し、各アプリはこれを参照する。
2. **Zod**: スキーマ定義には Zod を使用し、ランタイムバリデーションと静的型生成を両立させる。
3. **独立性**: 外部ライブラリ（Prismaなど）への依存は避け、純粋なスキーマ定義とする。

