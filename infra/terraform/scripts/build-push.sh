#!/usr/bin/env bash
set -euo pipefail

REGION=${REGION:-asia-northeast1}
PROJECT_ID=${PROJECT_ID:?"PROJECT_ID is required"}
# Extract prefix from tfvars (naive grep) to determine repo name
TFVARS_FILE="infra/terraform/terraform.tfvars"
if [[ ! -f "${TFVARS_FILE}" ]]; then
  TFVARS_FILE="../../infra/terraform/terraform.tfvars"
fi
PREFIX="ax"
if [[ -f "${TFVARS_FILE}" ]]; then
  TFVARS_PREFIX=$(grep 'prefix' "${TFVARS_FILE}" | sed -n "s/.*prefix[[:space:]]*=[[:space:]]*[\"']\([^\"']*\)[\"'].*/\1/p" | head -1)
  if [[ -n "${TFVARS_PREFIX}" ]]; then
    PREFIX="${TFVARS_PREFIX}"
  fi
fi

REPO="${PREFIX}-repo"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}"
PLATFORM=${PLATFORM:-linux/amd64}

cd "$(dirname "$0")/../../.."

# Ensure buildx builder is available
if ! docker buildx inspect >/dev/null 2>&1; then
  echo "Creating docker buildx builder..."
  docker buildx create --use --name "${PREFIX}-builder" || true
fi

echo "Login to Artifact Registry"
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

build_and_push() {
  local name=$1
  local dockerfile=$2
  echo "Building ${name} for platform ${PLATFORM} and pushing to ${REGISTRY}/${name}:latest"
  docker buildx build \
    --platform "${PLATFORM}" \
    -t "${REGISTRY}/${name}:latest" \
    -f "${dockerfile}" \
    . \
    --push
}

# 並列実行: server/workerを並列、clientは重いので単独
# （GitHub Actionsランナーは2コア/7GBのため、3つ同時は過負荷の可能性あり）
build_and_push server apps/server-node/Dockerfile &
PID1=$!
build_and_push worker apps/worker-node/Dockerfile &
PID2=$!

# server/workerの完了を待つ
wait $PID1 && echo "server: OK" || { echo "server: FAILED"; exit 1; }
wait $PID2 && echo "worker: OK" || { echo "worker: FAILED"; exit 1; }

# clientはNext.jsビルドが重いため、server/worker完了後に実行
build_and_push client apps/client/Dockerfile
echo "client: OK"

echo "Done: pushed linux/amd64 images to ${REGISTRY}"
