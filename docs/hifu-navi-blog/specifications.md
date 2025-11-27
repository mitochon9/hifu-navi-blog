# HIFU機種×クリニック×価格比較サイト 仕様書 v1.0（UGCなし / Supabase単一運用）

## 0. 目的

HIFU施術の**機種ごとの取扱いクリニック**と**正規化された価格情報**を集約し、ユーザーが**同条件で比較・意思決定できる**情報体験を提供する。

運用は管理者（お前）1名、人力で正確なデータを蓄積。

---

## 1. Problem / Solution

### 1.1 Problem

**P1. 条件比較ができない**

* 機種名・部位・ショット/回数・価格種別（初回/通常/モニター等）が院ごとにバラバラで、ユーザーは同条件比較が不能。

**P2. 価格の意味が分からない**

* 「HIFU〇円」という表記だけでは、施術内容が違うため妥当性判断ができない。

**P3. 信頼できる整理済み情報が不足**

* 情報が散在、更新頻度も不明で、結局公式サイト巡回が必要。

### 1.2 Solution

**S1. 正規化された価格DB**

* **機種×部位×ショット/回数×価格種別**で統一格納。
* “同条件比較”が即可能。

**S2. 透明性の担保**

* 価格に必ず**根拠URL**と**確認日**を紐づけ表示。
* “いつのどこ情報か”を常に見せる。

**S3. 意思決定導線**

* 機種起点／クリニック起点／条件比較起点の3導線で最短到達。

---

## 2. 対象ユーザー / JTBD

### 対象ユーザー

* HIFUを受けたい一般ユーザー（機種を知らない層〜指名買い層まで）
* 価格と内容の妥当性を比較したい層

### JTBD

* 自分に合う機種を理解したい
* 特定機種の取扱い院と相場を知りたい
* 同条件で価格比較して候補を絞りたい
* 根拠付き最新価格を見て安心したい

---

## 3. 主要ユースケース

**UC1 機種から探す**

1. 機種一覧 → 2. 機種詳細 → 3. 取扱い院＆価格レンジ → 4. 院詳細

**UC2 エリア/クリニックから探す**

1. エリア検索 → 2. クリニック一覧 → 3. 院詳細で機種別価格確認

**UC3 条件比較する**

1. 機種/部位/ショット/価格種別/エリア指定
2. 同条件一覧を価格/距離/更新日で比較
3. 根拠確認 → 候補確定

**UC4 相場を知る**

1. 相場ページ → 2. 機種×部位×ショットのレンジ確認 → 3. 比較へ遷移

---

## 4. IA（情報設計原則）

1. **正規化単位で比較表示**

   * 機種名は正規名＋別名
   * 部位は固定enum
   * ショット/回数は必須
2. **価格の透明性**

   * 価格種別／確認日／根拠URLを必須表示
3. **検索と比較を最優先**

   * サイトのどこからでも「探す/比較する」に戻れる
4. **意思決定順に並べる**

   * 機種理解 → 取扱い院 → 価格妥当性 → 予約

---

## 5. システム構成

* **Frontend**: Next.js（Vercel）

  * App Router
  * ISR（時間ベース＋オンデマンド）
* **API**: Hono（Cloudflare Workers）

  * 条件比較/検索/キャッシュ/集計の薄いAPI
* **DB/Storage/Auth/Admin**: Supabase

  * Postgres
  * 管理画面（Admin UI）もNext.jsで自作
  * Studio直編集は緊急時のみ

---

## 6. データモデル（Supabase）

### 6.1 共通enum

* `body_part`: face_full / cheek / jawline / neck / eye / forehead / other
* `unit_type`: shots / sessions
* `price_type`: normal / first / monitor / campaign
* `status`: draft / published / archived

### 6.2 テーブル

**clinics**

* id uuid PK
* name text
* slug text unique
* address text
* prefecture text
* city text
* nearest_station text nullable
* geo_lat float nullable
* geo_lng float nullable
* official_url text
* description_short text nullable
* status enum
* updated_at timestamptz
* created_at timestamptz

**devices**

* id uuid PK
* name_official text
* aliases text[]
* manufacturer text nullable
* description_short text
* tags text[]
* status enum
* updated_at / created_at

**plans**（院のメニュー正規化）

* id uuid PK
* clinic_id FK clinics.id
* device_id FK devices.id
* body_part enum
* shots_or_sessions int
* unit_type enum
* plan_label text（例: “全顔”, “頬＋フェイスライン”）
* status enum
* updated_at / created_at

**price_entries**

* id uuid PK
* plan_id FK plans.id
* price_yen int
* price_type enum
* source_url text
* confirmed_date date
* disclaimer text nullable
* is_active bool
* status enum
* updated_at / created_at

### 6.3 ルール

* `plans` は**院×機種×部位×単位の一意キー**で重複禁止（実装でユニーク制約）
* `price_entries` は同一planに対して複数可（価格変更履歴に対応）
* フロントは原則 `status = published` かつ `is_active = true` のみ表示

---

## 7. サイトマップ v1.0

* `/` TOP
* `/devices` 機種一覧
* `/devices/[slug]` 機種詳細
* `/clinics` クリニック検索/一覧
* `/clinics/[slug]` クリニック詳細
* `/compare` 条件比較
* `/prices` 相場ガイド
* `/areas/[pref]/[city]` エリアLP（SEO）
* `/about` 運営/データの透明性
* `/policy` 免責/プライバシー

---

## 8. ページ仕様

### 8.1 TOP `/`

**目的**: 探索/比較開始の最短入口
**表示**

* ヒーロー検索（エリア/駅/機種）
* 3導線ボタン：機種から / エリアから / 条件比較
* 人気機種（院数/閲覧）
* 最新更新クリニック
* 透明性宣言（根拠/確認日表示の理由）

**機能**

* 検索→`/clinics` or `/compare`
* 人気カード→詳細へ

**ISR**: 12h
**SEO**: H1は価値を一文、FAQ軽く
**KPI**: 検索開始率、compare遷移率

---

### 8.2 機種一覧 `/devices`

**目的**: 機種の把握と選択
**表示**

* 機種カード（正規名/別名/特徴タグ/相場レンジ/院数）

**機能**

* フィルタ（用途/痛み/価格帯/メーカー）
* ソート（人気/相場安い/院数）

**ISR**: 24h
**SEO**: 機種名＋別名でtitle最適化
**KPI**: 詳細遷移率

---

### 8.3 機種詳細 `/devices/[slug]`

**目的**: “その機種を受けるならどこでいくら”を確定
**表示**

* 概要（メリデメと他機種比較視点）
* 向いてる/向かない
* 部位別相場レンジ
* 取扱いクリニック一覧（価格/距離/更新日）

**機能**

* エリア/価格種別フィルタ
* compareへ（機種固定）

**ISR**: 6–24h
**オンデマンドISR**: 価格更新時
**KPI**: compare遷移率、院詳細遷移率

---

### 8.4 クリニック一覧 `/clinics`

**目的**: エリア/条件で候補を絞る
**表示**

* 検索条件UI
* クリニックカード（対応機種/代表価格/更新日/住所）

**機能**

* フィルタ（エリア/駅/機種/部位/価格帯/価格種別）
* ソート（価格/距離/更新日）

**ISR**: 6–12h
**KPI**: 詳細遷移率

---

### 8.5 クリニック詳細 `/clinics/[slug]`

**目的**: 最終判断材料の提供
**表示**

* 基本情報（地図/公式URL/最寄り）
* 対応機種一覧
* 価格表（機種×部位×ショット×種別）
* 根拠URL＋確認日＋注意書き

**機能**

* compare追加
* 根拠展開

**ISR**: 6–24h（オンデマンド対応）
**KPI**: compare追加率、予約リンクCTR

---

### 8.6 条件比較 `/compare`

**目的**: 同条件で即比較
**表示**

* 条件入力（機種/部位/ショット/価格種別/エリア）
* 結果テーブル（価格/距離/更新日/根拠）

**機能**

* ソート（価格/距離/更新日）
* 条件URL共有

**ISR**: 24h
**結果API**: Workersでキャッシュ（5–30min）
**KPI**: 条件入力完了率、根拠閲覧率

---

### 8.7 相場 `/prices`

**目的**: 価格妥当性の基準提供
**表示**

* 機種×部位×ショットのレンジ（平均/中央値/分布）
* 読み方ガイド
* 相場外の一般的理由

**機能**

* compareへ条件引継ぎ

**ISR**: 24h
**KPI**: compare遷移率

---

### 8.8 エリアLP `/areas/[pref]/[city]`

**目的**: SEO流入→地域候補提示
**表示**

* 地域の取扱い院一覧
* 人気機種/相場
* FAQ（地域名入り）

**ISR**: 24h
**KPI**: 直帰率/詳細遷移率

---

## 9. Admin（管理画面）仕様

**目的**: お前がミスらず高速に入力できるCMS代替

### 9.1 画面

* `/admin/login`
* `/admin/clinics`
* `/admin/devices`
* `/admin/plans`
* `/admin/prices`

### 9.2 機能

* 一覧/検索/フィルタ
* 新規/編集/アーカイブ
* `draft/published` 切替
* 価格更新時に自動で前エントリを `is_active=false`
* 入力バリデーション

  * shots必須
  * price_type必須
  * source_url必須
  * confirmed_date必須
* 更新後WebhookでオンデマンドISR発火

---

## 10. デザイン仕様（超重要）

### 10.1 デザインゴール

* **医療系に必要な“信用感”**
* **比較のしやすさ**
* **広告臭の排除**
* **情報密度は高いのに“疲れない”**

### 10.2 トーン＆ムード

* 清潔、静か、過剰に派手にしない
* “美容クリニックのLPっぽい煽り”はNG
  → 比較サイトとして一発で信用を失う

### 10.3 主要UIパターン

**A. 検索バー（ヒーロー）**

* 1行で完結（エリア/駅/機種のオートコンプリート）
* 余白広め、強い視線誘導

**B. 比較テーブル**

* 行はクリニック、列は条件要素
* 価格は太字、更新日は小さく
* 根拠はアイコン→ポップオーバー
* ソートは常に可視化（ユーザーはすぐ並べ替えたい）

**C. カード（機種/クリニック）**

* “一目で比較できる”最小情報だけ
* 価格帯/院数/更新日を固定位置で表示

**D. 透明性UI**

* 「確認日」「根拠URL」を**“邪魔にならないけど必ず見える位置”**
* 根拠リンクは外部アイコンつき

### 10.4 タイポグラフィ/可読性

* 見出しは短く、太さで階層を分ける
* 数字（価格/ショット）は**等幅も検討**して比較性を上げる
* 1画面の情報量は“比較に必要な分だけ”
  → 説明は折りたたみで逃がす

### 10.5 カラー/アクセシビリティ

* ベースは白〜薄グレー、アクセント1色で十分
* 強調は色より**太さ/サイズ/間隔**
* コントラストはWCAG AA以上

### 10.6 レイアウト

* 最大幅は読みやすいコンテンツ幅（PCでも広げすぎない）
* Stickyな条件バー（compare/clinics）
  → ユーザーの戻りコスト削減

### 10.7 体験演出（軽めでいい）

* ローディングはスケルトン
* フィルタ変更時の小さなトランジション
* ただし**アニメ盛りすぎると信用下がる**から抑えろ

---

## 11. 非機能要件

* CWV目標：LCP < 2.5s / INP良好
* APIは読み取り中心でエッジキャッシュ活用
* 価格表示は必ず根拠/確認日つき
* RLS/認証で管理画面保護

---

## 12. MVPスコープ（最初に作る）

**必須**

* TOP / devices / clinics / compare / prices
* Admin CRUD（clinics/devices/plans/prices）
* ISR（時間＋オンデマンド）
* 正規化表示＆根拠表示

### 構築優先順位（MVP）

#### Phase 1: 基盤

- 型定義・モックデータ
- レイアウト（Header/Footer）
- 共通UIコンポーネント

#### Phase 2: 主要ページ

- TOP /（ヒーロー検索、3導線ボタン）
- 機種一覧/詳細 /devices
- クリニック一覧/詳細 /clinics

#### Phase 3: 比較機能

- 条件比較 /compare
- 相場ガイド /prices

#### Phase 4: 補足ページ

- /about, /policy

**後回し**

* エリアLPの量産
* 相場の高度統計（分布グラフ強化）
* UGC/ログイン