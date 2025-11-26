# デプロイガイド

このドキュメントでは、ax-saas-template のデプロイ方法について説明します。

## 目次

- [概要](#概要)
- [クイックスタート（初回セットアップのみ）](#クイックスタート)
- [初期セットアップ（詳細）](#初期セットアップ)
- [デプロイフロー](#デプロイフロー)
  - [初回セットアップ（手動）](#初回セットアップ手動)
  - [通常のデプロイ（自動）](#通常のデプロイ自動)
- [トラブルシュート](#トラブルシュート)

## 概要

本テンプレートは、GitHub Actions を使用した自動デプロイに対応しています。

**初回セットアップ（手動）**: プロジェクトごとに1回だけ実行
- CI/CD用のサービスアカウントやWIF設定
- Terraform stateバケットの作成
- 初回のインフラ作成（Cloud SQLインスタンスなど）

**通常のデプロイ（自動）**: コードをpushするだけで自動実行
- **stg 環境**: `main` ブランチへの push/merge で自動デプロイ
- **prod 環境**: タグ `v*` を push で自動デプロイ

デプロイフローの詳細は [システムアーキテクチャ](architecture.md#デプロイフロー) を参照してください。

## クイックスタート

**重要**: 以下の手順は**初回セットアップ時のみ**必要です。2回目以降のデプロイは自動で行われます（[通常のデプロイ](#通常のデプロイ自動)を参照）。

スクリプトで一気にセットアップする場合は、以下の手順を実行してください。

```bash
# 【手動・初回のみ】1) プロジェクト準備
gcloud config set project <YOUR_PROJECT_ID>

# （推奨）Terraform実行に必要なAPIを事前に有効化
gcloud services enable serviceusage.googleapis.com cloudresourcemanager.googleapis.com \
  --project <YOUR_PROJECT_ID>

# 【手動・初回のみ】2) 変数設定
export PROJECT_ID=<YOUR_PROJECT_ID>
export ORG_REPO=<org>/<repo>  # GitHubリポジトリ（例: kikagaku/ax-saas-template）
export REGION=asia-northeast1

# 【手動・初回のみ】2-1) terraform.tfvarsの作成
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvarsを編集: project_id, db_password を設定

# 【手動・初回のみ】3) CI 用 SA / WIF の一括作成
cd infra/terraform/scripts
PROJECT_ID=$PROJECT_ID ORG_REPO=$ORG_REPO SKIP_BUCKET_IAM=1 ./bootstrap-wif.sh
# 出力: SA_EMAIL, WIF_PROVIDER をメモ
# 注意: この時点ではバケットがまだ作成されていないため、SKIP_BUCKET_IAM=1でバケットIAM権限をスキップ
#       バケット作成後（ステップ4-1）で再実行してバケットIAM権限を付与してください

# 【手動・初回のみ】4) Terraform state バケット作成（stg/prod）
BUCKET_STG=tfstate-<app>-stg
BUCKET_PRD=tfstate-<app>-prd
gsutil mb -l $REGION gs://$BUCKET_STG
gsutil mb -l $REGION gs://$BUCKET_PRD
gsutil versioning set on gs://$BUCKET_STG
gsutil versioning set on gs://$BUCKET_PRD

# 【手動・初回のみ】4-1) CI SA にバケットへのアクセス権限を付与
# bootstrap-wif.sh を再実行してバケットIAM権限を付与（BUCKET_STG/BUCKET_PRD環境変数を渡す）
# バケット作成後（ステップ4）に実行する必要があります
cd infra/terraform/scripts
PROJECT_ID=$PROJECT_ID ORG_REPO=$ORG_REPO BUCKET_STG=$BUCKET_STG BUCKET_PRD=$BUCKET_PRD ./bootstrap-wif.sh

# 【手動・初回のみ】5) GitHub Secrets 登録（後述の「GitHub Secrets 設定」を参照）

# 【手動・初回のみ】6) 初回インフラ作成（ローカルで実行）
# 重要: terraform.tfvarsはCIでは読めないため、既存リソースのインポートはローカルで実行する必要があります
# 重要: CIと同じバックエンド設定（prefix）を使用する必要があります
cd infra/terraform/scripts
export BUCKET_STG=tfstate-<app>-stg
TF_BACKEND_BUCKET=$BUCKET_STG TF_BACKEND_PREFIX=stg/terraform.tfstate ./infra-apply-staged.sh
# これにより、terraform.tfvarsから変数を読み取り、既存リソースを自動インポートしてからインフラを作成します
# 既存リソースがない場合でも、このスクリプトで初回インフラを作成できます
# CIと同じstateファイル（prefix=stg/terraform.tfstate）を使用するため、CIでのデプロイも正常に動作します

# 【自動】7) 以降のデプロイは自動実行
# 初回インフラ作成が完了したら、mainブランチにpush/mergeすると、GitHub Actionsのdeploy-stgワークフローが自動実行されます
# - コンテナイメージのビルド/プッシュ
# - Cloud Runサービスの更新
# - DBマイグレーションの実行
# stg: main に push/merge → 自動で build-push → apply → migrate → rollout
# prod: タグ v* を push → 同様
```

## 初期セットアップ

**重要**: このセクションは、クイックスタートで自動化スクリプト（`bootstrap-wif.sh`など）を使用する場合には**不要**です。以下のセクションは、スクリプトを使わずに手動でセットアップする場合、または詳細な仕組みを理解したい場合の参考情報です。

クイックスタートで自動化されている作業：
- ✅ 3. WIF Provider / デプロイ用 SA 作成（`bootstrap-wif.sh`で自動化）
- ✅ 5. DB パスワード運用（`secret-sync-db-url.sh`で自動化）

手動で確認・設定が必要な作業：
- ⚠️ 2. GCS バケット作成後のIAM権限付与（CI SAへの権限付与は手動で必要）
- ⚠️ 4. GitHub Secrets 設定（手動で設定が必要）

### 1. gcloud のプロジェクトを明示

以降の操作が他プロジェクトに飛ばないよう、**必ず明示**します。

```bash
gcloud config set project <YOUR_PROJECT_ID>
# 任意: ADC のクォータ課金先も合わせたい場合
gcloud auth application-default set-quota-project <YOUR_PROJECT_ID>
```

### 2. GCS バケット作成（Terraform state 用）

バージョニングを有効にして作成します。

```bash
gsutil mb -l asia-northeast1 gs://<bucket-name>
gsutil versioning set on gs://<bucket-name>
```

**重要**: CI のサービスアカウント（後述 `ci-deployer@...`）に、バックエンド用バケットの IAM を付与してください。権限が無い場合、GCS は存在秘匿のため `bucket doesn't exist` を返します。

```bash
BUCKET=<bucket-name>                           # 例: tfstate-myapp-stg
SA="ci-deployer@<PROJECT_ID>.iam.gserviceaccount.com"

# 最小権限（推奨）
gcloud storage buckets add-iam-policy-binding gs://$BUCKET \
  --member="serviceAccount:$SA" \
  --role="roles/storage.objectAdmin"

gcloud storage buckets add-iam-policy-binding gs://$BUCKET \
  --member="serviceAccount:$SA" \
  --role="roles/storage.bucketViewer"   # storage.buckets.get権限を含む（gsutil ls -b に必要）

gcloud storage buckets add-iam-policy-binding gs://$BUCKET \
  --member="serviceAccount:$SA" \
  --role="roles/storage.legacyBucketReader"   # UBLA 環境でも backend の一覧取得で必要になる場合あり
```

### 3. WIF Provider / デプロイ用 SA 作成（stg/prod 各環境）

#### クイックセットアップ（推奨）

付属スクリプトを使用して一括作成できます。

```bash
cd infra/terraform/scripts
PROJECT_ID=<YOUR_PROJECT_ID> ORG_REPO="<org>/<repo>" ./bootstrap-wif.sh
# ORG_REPOはGitHubリポジトリの形式（例: kikagaku/ax-saas-template）
# 出力の SA_EMAIL と WIF_PROVIDER を GitHub Secrets に転記
```

#### 手動セットアップ

**デプロイ用サービスアカウント（CI が使う）**の作成と最小権限付与:

```bash
PROJECT_ID="<YOUR_PROJECT_ID>"
gcloud iam service-accounts create ci-deployer \
  --project ${PROJECT_ID} \
  --display-name "CI Deployer"

SA="ci-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

# 必要最小ロール（必要に応じて調整）
for ROLE in \
  roles/run.admin \
  roles/artifactregistry.admin \
  roles/secretmanager.admin \
  roles/cloudtasks.admin \
  roles/cloudsql.admin \
  roles/serviceusage.serviceUsageAdmin \
  roles/resourcemanager.projectIamAdmin \
  roles/compute.networkAdmin \
  roles/compute.loadBalancerAdmin \
  roles/vpcaccess.admin \
  roles/iam.serviceAccountAdmin
do
  gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SA}" \
    --role="${ROLE}"
done
```

**重要**: CI SA は Terraform 実行主体として、ランタイムSAに対する actAs が必要です。このテンプレートでは `TF_VAR_deployer_service_account` に SA を渡すと、Terraform 側で server/worker/client/migrate それぞれに `roles/iam.serviceAccountUser` を付与します。

**Workload Identity Federation（WIF）** の作成（GitHub OIDC 用）:

```bash
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')
POOL_ID="github"
PROVIDER_ID="github-oidc"

# 既存なら create はスキップ可
gcloud iam workload-identity-pools describe ${POOL_ID} --location=global >/dev/null 2>&1 || \
  gcloud iam workload-identity-pools create ${POOL_ID} \
    --location=global \
    --display-name="GitHub"

gcloud iam workload-identity-pools providers create-oidc ${PROVIDER_ID} \
  --location=global \
  --workload-identity-pool=${POOL_ID} \
  --display-name="GitHub OIDC" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref,attribute.actor=assertion.actor,attribute.aud=assertion.aud" \
  --attribute-condition="attribute.repository=='<your-org>/<your-repo>'"

# CI 用 SA に WIF の利用権限を付与（pool レベルで OK）
SA="ci-deployer@${PROJECT_ID}.iam.gserviceaccount.com"
gcloud iam service-accounts add-iam-policy-binding ${SA} \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/<your-org>/<your-repo>" \
  --role="roles/iam.workloadIdentityUser"
```

**ポイント**: `--attribute-mapping` で属性を定義し、**`--attribute-condition` は `attribute.*` を参照**します（`assertion.*` ではありません）。

さらに厳密にするなら、`--attribute-condition` に `attribute.repository=='<your-org>/<your-repo>' && attribute.ref=='refs/heads/main'` のようにブランチ条件も追加できます。

### 4. GitHub Secrets 設定

以下の Secrets を GitHub リポジトリに登録してください。

#### STG 環境

- `GCP_PROJECT_ID_STG`: デプロイ先 GCP プロジェクト ID
- `WIF_PROVIDER_STG`: WIF Provider のフルリソース名（`projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/<POOL_ID>/providers/<PROVIDER_ID>`）
- `WIF_SA_STG`: CI から Terraform/デプロイを実行する SA（メールアドレス、例: `ci-deployer@<project-id>.iam.gserviceaccount.com`）
- `TFSTATE_BUCKET_STG`: Terraform の GCS バックエンド用バケット名（`gs://` を含まない純粋なバケット名）
- `DB_PASSWORD_STG`: 初回ブートストラップ用（ブートストラップ後は削除可）

#### PROD 環境

- `GCP_PROJECT_ID_PRD`: デプロイ先 GCP プロジェクト ID
- `WIF_PROVIDER_PRD`: WIF Provider のフルリソース名
- `WIF_SA_PRD`: CI から Terraform/デプロイを実行する SA（メールアドレス）
- `TFSTATE_BUCKET_PRD`: Terraform の GCS バックエンド用バケット名（`gs://` を含まない純粋なバケット名）
- `DB_PASSWORD_PRD`: 初回ブートストラップ用（ブートストラップ後は削除可）

#### WIF_PROVIDER の取得方法

```bash
gcloud iam workload-identity-pools providers describe <PROVIDER_ID> \
  --location=global --workload-identity-pool=<POOL_ID> --format='value(name)'
```

### 5. DB パスワード運用（Secret Manager を真実とする）

**重要**: 
- Cloud SQLインスタンスは、Terraformで作成した後でないと `secret-sync-db-url.sh` を実行できません。
- Cloud SQLインスタンスの作成には約10〜15分かかります。初回セットアップ時は時間に余裕を持って実行してください。

初回適用後、Cloud SQL のプライベートIPを取得し、Secret Manager の `database-url` を作成/上書きします。

**クイック同期**: 付属スクリプトで一括作成/同期できます。

```bash
cd infra/terraform/scripts
# terraform.tfvars の db_password から自動的に読み取ります（PASSWORD 指定不要）
PROJECT_ID=<YOUR_PROJECT_ID> INSTANCE=ax-db USER=appuser ./secret-sync-db-url.sh

# または、明示的にパスワードを指定する場合
PROJECT_ID=<YOUR_PROJECT_ID> INSTANCE=ax-db USER=appuser PASSWORD='<plain>' ./secret-sync-db-url.sh
```

**パスワード解決の優先順位**:
1. `PASSWORD` 環境変数（最優先）
2. `DB_PASSWORD` 環境変数
3. `terraform.tfvars` の `db_password` 値（自動読み取り）
4. `PASSWORD_FILE` 環境変数で指定されたファイル
5. 対話的プロンプト（フォールバック）

以後 CI は `database-url` からパスワードを抽出→Cloud SQL 同期を自動実行します。

1. TerraformでCloud SQLインスタンスを作成（初回のみ手動、またはGitHub Actionsで自動実行）
2. Cloud SQLインスタンス作成後、Cloud SQL のプライベートIPを取得し、Secret Manager の `database-url` を作成/上書き
   - 形式: `postgresql://appuser:<ENCODED_PASSWORD>@<PRIVATE_IP>:5432/app?schema=public`
   - パスワードは URL エンコード必須
3. 以後のCIは、`database-url` からパスワードを抽出→Cloud SQL の `appuser` に同期（Actions に実装済み）
4. `DB_PASSWORD_*` Secrets は初回ブートストラップ後は不要（削除推奨）

## デプロイフロー

### 初回セットアップ（手動）

初回セットアップは [クイックスタート](#クイックスタート) の手順に従って手動で実行してください。

### 通常のデプロイ（自動）

初回セットアップが完了したら、以降は**コードをpushするだけで自動的にデプロイされます**。手動での操作は不要です。

### CI パイプライン（自動）

`main` ブランチへの push/merge で CI パイプラインが**自動実行**されます。

- Lint（Biome）
- Typecheck（TypeScript）
- Unit Test
- Architecture Check（FSD, 依存, guards, knip）

詳細は [.github/workflows/ci.yml](../.github/workflows/ci.yml) を参照してください。

### stg デプロイ（自動）

CI パイプラインが成功した場合、**自動的に** stg 環境にデプロイされます。

1. **Build & Push**: コンテナイメージを buildx でビルド → Artifact Registry へ push（自動）
2. **Apply**: Terraform を GCS Backend で `init` → `apply`（自動）
   - Cloud Run の `image` はダイジェスト固定 → push 毎に `terraform apply` で差分検知して新 Revision へ
   - 依存リソース作成更新 → Cloud SQL ユーザーのパスワードを Secret（GitHub Secrets 優先、なければ Secret Manager の database-url）に合わせて同期（自動）
3. **Migrate**: Cloud Run Job で `prisma migrate deploy` を実行（自動）
   - `succeededCount/failedCount` と `completionTime` をポーリングして結果を判定
4. **Rollout**: migrate 成功時のみ、新しいリビジョンを作成（`BUILD_SHA` で差分を強制）（自動）

詳細は [.github/workflows/deploy-stg.yml](../.github/workflows/deploy-stg.yml) を参照してください。

### prod デプロイ（自動）

タグ `v*` を push で**自動的に** prod 環境にデプロイされます。

フローは stg デプロイと同様です。

詳細は [.github/workflows/deploy-prod.yml](../.github/workflows/deploy-prod.yml) を参照してください。

## トラブルシュート

### 最終デプロイ日が更新されない

- 原因: Cloud Run の `image` をタグで指定すると差分として検出されないことがある
- 対応: ダイジェスト指定（本リポジトリは対応済み）/ 一時的に `terraform apply -replace=google_cloud_run_v2_service.<service>`

### DB マイグレーションが失敗する

- `gcloud run jobs executions list --region <region> --project <project>` でログを確認
- `DATABASE_URL` Secret の値/権限、VPC Connector、Private IP を確認

### Artifact Registry への push が失敗する

- `gcloud auth configure-docker <region>-docker.pkg.dev` を実行
- WIF/SA の権限（Artifact Registry Writer）を確認

### Terraform init で `storage: bucket doesn't exist`

- バケット名（`TFSTATE_BUCKET_*`）が正しいか（`gs://` なしの純名）
- バケットの所在プロジェクトと `PROJECT_ID` の整合
- CI サービスアカウントにバケット IAM（`roles/storage.objectAdmin` と必要に応じ `roles/storage.legacyBucketReader`）が付いているか

### ロードバランサー経由でアクセスできない

- ロードバランサーのプロビジョニング完了を確認（数分かかる場合あり）
- `terraform output load_balancer_ip` でIPアドレスを確認
- Cloud Runサービスが `INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER` に設定されているか確認
- ロードバランサーのURLマップでパスルーティング（`/api/*` → server）が正しく設定されているか確認

### WorkerがCloud Tasksから呼び出せない（403エラー）

- `ax-tasks-invoker-sa` に `roles/run.invoker` が付与されているか確認
- Cloud TasksのHTTPタスク作成時にOIDCトークンが設定されているか確認
- workerのingressが `INGRESS_TRAFFIC_ALL` に設定されているか確認

### 既存リソースが存在するエラー（409エラー）

既存のGCPリソースが存在する場合、以下のようなエラーが発生することがあります：

```
Error: Error creating Repository: googleapi: Error 409: the repository already exists
Error: Error creating Secret: googleapi: Error 409: Secret [...] already exists
```

これは、既存のGCPリソースがTerraform stateにインポートされていないためです。

**既存リソースが存在する主なケース**:

1. **以前に手動で作成したリソース**
   - GCPコンソールや`gcloud`コマンドで直接作成したリソース
   - 例: Artifact Registryリポジトリ、Secret Managerシークレットなど

2. **別のTerraform実行で作成されたリソース**
   - 別のTerraformディレクトリやプロジェクトで作成されたリソース
   - 以前のTerraform stateが失われた場合

3. **他のツールやスクリプトで作成されたリソース**
   - 別のインフラ管理ツールで作成されたリソース
   - カスタムスクリプトで作成されたリソース

4. **以前のプロジェクトから引き継いだリソース**
   - 既存のGCPプロジェクトにこのテンプレートを適用する場合
   - 既存のインフラを段階的にTerraform化する場合

5. **試行錯誤の過程で作成されたリソース**
   - 初期セットアップ時のテストで作成されたリソース
   - 失敗したTerraform実行で部分的に作成されたリソース

6. **別環境からリソースをコピーした場合**
   - stg環境からprod環境へリソースをコピーした場合など

**解決方法**:

#### 方法1: 自動インポート（推奨）

ローカルで`infra-apply-staged.sh`を実行すると、既存リソースを自動的にインポートします：

```bash
cd infra/terraform/scripts
export BUCKET_STG=tfstate-<app>-stg
# 重要: CIと同じprefixを指定する必要があります
TF_BACKEND_BUCKET=$BUCKET_STG TF_BACKEND_PREFIX=stg/terraform.tfstate ./infra-apply-staged.sh
```

このスクリプトは、`terraform.tfvars`から変数を読み取り、既存リソースを自動的にインポートします。
**注意**: CIと同じstateファイルを使用するため、`TF_BACKEND_PREFIX=stg/terraform.tfstate`を必ず指定してください。

#### 方法2: 手動インポート

自動インポートがうまくいかない場合、手動でインポートしてください。

詳細な手順は [infra/terraform/README.md](../infra/terraform/README.md#35-既存リソースのインポート初回のみ) を参照してください。

**インポートが必要な主なリソース**:
- Artifact Registry リポジトリ
- Secret Manager シークレット
- Cloud Tasks キュー
- サービスアカウント（server/worker/client/migrate/tasks_invoker）
- ネットワーク（VPC、グローバルIPアドレス）

### Cloud SQL 認証エラー（P1000）

`Error: P1000: Authentication failed ... appuser` が出る場合は、Cloud SQL のユーザーと Secret の不一致が原因です。

1. ユーザー確認:
   ```bash
   gcloud sql users list --instance ax-db --project $PROJECT_ID
   ```

2. パスワードリセット:
   ```bash
   NEW='<your-password>'
   gcloud sql users set-password appuser \
     --instance ax-db \
     --project "$PROJECT_ID" \
     --password "$NEW"
   ```

3. DATABASE_URL を同値で更新（URL エンコードに注意）:
   ```bash
   HOST=$(gcloud sql instances describe ax-db --project "$PROJECT_ID" --format='value(ipAddresses.ipAddress)')
   ENC=$(python3 - <<'PY' "$NEW"
   import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=''))
   PY
   )
   printf 'postgresql://appuser:%s@%s:5432/app?schema=public\n' "$ENC" "$HOST" | \
     gcloud secrets versions add database-url --project "$PROJECT_ID" --data-file=-
   ```

4. CI 再実行（apply → migrate）

### WIF Provider 作成で INVALID_ARGUMENT

- `--attribute-condition` が `attribute.*` を参照しているか確認（例を再実行）

### rollout で 403 iam.serviceaccounts.actAs

- `TF_VAR_deployer_service_account` が渡っているか確認
- 対象 SA に `roles/iam.serviceAccountUser` が付いているか確認

詳細は [インフラ詳細](../infra/terraform/README.md#5-トラブルシュート要点) を参照してください。

## デフォルト設定値

本テンプレートのデフォルト設定値:

- **リージョン**: `asia-northeast1`
- **サービス名**:
  - Server: `ax-server`
  - Worker: `ax-worker`
  - Client: `ax-client`
- **データベース**:
  - インスタンス名: `ax-db`
  - データベース名: `app`
  - ユーザー名: `appuser`
- **Cloud Tasks キュー**: `demo-queue`
- **サービスアカウント**:
  - Server: `ax-server-sa`
  - Worker: `ax-worker-sa`
  - Client: `ax-client-sa`
  - Tasks Invoker: `ax-tasks-invoker-sa`

これらの値は `infra/terraform/variables.tf` で変更可能です。

## 参照ドキュメント

- [システムアーキテクチャ](architecture.md) - システム全体の構成とデプロイフロー
- [インフラ詳細](../infra/terraform/README.md) - Terraform の詳細とローカル実行方法
