#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

SERVER_URL=$(terraform output -raw server_url)
WORKER_URL=$(terraform output -raw worker_url)
CLIENT_URL=$(terraform output -raw client_url)

echo "Server health: $SERVER_URL/health"
curl -fsS "$SERVER_URL/health" | jq -r '.' || true

echo "Worker health: $WORKER_URL/health"
curl -fsS "$WORKER_URL/health" | jq -r '.' || true

echo "Client HEAD: $CLIENT_URL"
curl -I "$CLIENT_URL" || true

# tasks
JOB_ID=$(curl -fsS -X POST "$SERVER_URL/tasks/enqueue" | jq -r '.jobId // .id // empty')
if [[ -n "$JOB_ID" ]]; then
  echo "Enqueued job: $JOB_ID"
  echo "Status: $SERVER_URL/tasks/status/$JOB_ID"
  curl -fsS "$SERVER_URL/tasks/status/$JOB_ID" | jq -r '.' || true
fi
