#!/usr/bin/env bash
set -euo pipefail

# Terraform Apply スクリプト
# SERVER_INTERNAL_URL の自己参照を解決するため、2回の apply を統合

TF_DIR=${TF_DIR:-.}
BUCKET_NAME=${BUCKET_NAME:?"BUCKET_NAME is required"}
BACKEND_PREFIX=${BACKEND_PREFIX:?"BACKEND_PREFIX is required (e.g., stg/terraform.tfstate)"}

echo "=== Terraform Apply ==="
echo "TF_DIR: ${TF_DIR}"
echo "BUCKET_NAME: ${BUCKET_NAME}"
echo "BACKEND_PREFIX: ${BACKEND_PREFIX}"
echo "PWD: $(pwd)"
echo ""

# バケット名の正規化（gs:// プレフィックスを削除）
BUCKET_NAME="${BUCKET_NAME#gs://}"
BUCKET_NAME="${BUCKET_NAME#file://}"

# Terraform の初期化
echo "📋 Initializing Terraform backend..."
cd "${TF_DIR}"
terraform init -upgrade -reconfigure \
  -backend-config="bucket=${BUCKET_NAME}" \
  -backend-config="prefix=${BACKEND_PREFIX}" || {
  echo "❌ Error: Terraform init failed"
  exit 1
}
echo "  ✓ Terraform initialized"
echo ""

# 初回 apply（リソース作成）
echo "🚀 Running Terraform apply (initial)..."
terraform apply -auto-approve -input=false -lock-timeout=10m || {
  echo "❌ Error: Initial Terraform apply failed"
  echo "  Check the error output above for details"
  exit 1
}
echo "  ✓ Initial apply completed"
echo ""

# SERVER_INTERNAL_URL を取得して再適用（自己参照を解決）
echo "📋 Getting SERVER_INTERNAL_URL from outputs..."
SERVER_URI=$(terraform output -raw run_server_url 2>/dev/null || echo "")

if [ -z "${SERVER_URI}" ]; then
  echo "⚠ Warning: run_server_url output not found"
  echo "  This may be normal on first deploy or if server URL is not yet available"
  echo "  Skipping SERVER_INTERNAL_URL configuration"
  echo ""
  echo "✓ Terraform apply completed (without SERVER_INTERNAL_URL)"
  exit 0
fi

echo "  Server URL: ${SERVER_URI}"
echo ""

# SERVER_INTERNAL_URL を含めて再適用
echo "🚀 Running Terraform apply (with SERVER_INTERNAL_URL)..."
SERVER_ENV="SERVER_INTERNAL_URL=\"${SERVER_URI}\""
terraform apply -auto-approve -input=false -lock-timeout=10m \
  -var="server_env={${SERVER_ENV}}" || {
  echo "❌ Error: Terraform apply with SERVER_INTERNAL_URL failed"
  echo "  Server URL: ${SERVER_URI}"
  echo "  Check the error output above for details"
  exit 1
}
echo "  ✓ Apply with SERVER_INTERNAL_URL completed"
echo ""

echo "✓ Terraform apply completed successfully"
echo "  Server URL configured: ${SERVER_URI}"

