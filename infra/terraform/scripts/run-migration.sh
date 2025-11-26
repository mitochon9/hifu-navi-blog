#!/usr/bin/env bash
set -euo pipefail

# Cloud Run Jobs のマイグレーション実行スクリプト
# エラーハンドリングと詳細ログ出力を強化

REGION=${REGION:-asia-northeast1}
PROJECT_ID=${PROJECT_ID:?"PROJECT_ID is required"}
TF_DIR=${TF_DIR:-.}

echo "=== DB Migration Execution ==="
echo "PROJECT_ID: ${PROJECT_ID}"
echo "REGION: ${REGION}"
echo "TF_DIR: ${TF_DIR}"
echo "PWD: $(pwd)"
echo ""

# jqの存在確認
if ! command -v jq &> /dev/null; then
  echo "❌ Error: jq is required but not installed"
  echo "  Install with: sudo apt-get update && sudo apt-get install -y jq"
  echo "  Or use: sudo apt-get install -y jq"
  exit 1
fi

# Terraform output からジョブ名を取得
echo "📋 Getting migration job name from Terraform..."
if ! terraform -chdir="${TF_DIR}" output migrate_job_name >/dev/null 2>&1; then
  echo "❌ Error: migrate_job_name output not found"
  echo "  Ensure Terraform has been applied and the migration job exists"
  exit 1
fi

JOB=$(terraform -chdir="${TF_DIR}" output -raw migrate_job_name)
if [ -z "${JOB}" ]; then
  echo "❌ Error: migrate_job_name output is empty"
  exit 1
fi
echo "  Job name: ${JOB}"
echo ""

# ジョブの存在確認
echo "🔍 Verifying job exists..."
set +e
JOB_EXISTS_OUTPUT=$(gcloud run jobs describe "${JOB}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" 2>&1)
JOB_EXISTS_CODE=${PIPESTATUS[0]}
set -e

if [ ${JOB_EXISTS_CODE} -ne 0 ]; then
  echo "❌ Error: Migration job '${JOB}' not found or not accessible"
  echo "  Error output:"
  echo "${JOB_EXISTS_OUTPUT}" | head -5
  echo ""
  echo "  Check:"
  echo "    1. Job exists: gcloud run jobs list --region ${REGION} --project ${PROJECT_ID}"
  echo "    2. You have permissions to access the job"
  echo "    3. Project ID is correct: ${PROJECT_ID}"
  exit 1
fi
echo "  ✓ Job exists and is accessible"
echo ""

# ジョブを実行
echo "🚀 Executing migration job..."
EXEC=""
EXEC_OUTPUT=""

set +e
if gcloud run jobs execute --help 2>/dev/null | grep -q -- "--wait"; then
  echo "  Using --wait flag (supported in this gcloud version)"
  EXEC_OUTPUT=$(gcloud run jobs execute "${JOB}" \
    --region "${REGION}" \
    --project "${PROJECT_ID}" \
    --wait 2>&1)
  EXEC_CODE=${PIPESTATUS[0]}
else
  echo "  --wait flag not available, will poll manually"
  EXEC_OUTPUT=$(gcloud run jobs execute "${JOB}" \
    --region "${REGION}" \
    --project "${PROJECT_ID}" 2>&1)
  EXEC_CODE=${PIPESTATUS[0]}
fi
set -e

if [ ${EXEC_CODE} -ne 0 ]; then
  echo "❌ Error: Failed to execute migration job"
  echo "  Command: gcloud run jobs execute ${JOB} --region ${REGION} --project ${PROJECT_ID}"
  echo "  Exit code: ${EXEC_CODE}"
  echo "  Output:"
  echo "${EXEC_OUTPUT}"
  exit 1
fi

# Execution ID を抽出
EXEC=$(printf "%s\n" "${EXEC_OUTPUT}" | sed -n 's/^Execution \[\([^]]\+\)\].*/\1/p' | tail -1)

# Execution ID が取得できない場合は、list で取得を試行
if [ -z "${EXEC}" ]; then
  echo "  Execution ID not found in output, querying from list..."
  for retry in $(seq 1 10); do
    set +e
    EXEC=$(gcloud run jobs executions list \
      --job "${JOB}" \
      --region "${REGION}" \
      --project "${PROJECT_ID}" \
      --format='value(name)' \
      --sort-by='~createTime' \
      --limit=1 2>&1)
    EXEC_LIST_CODE=${PIPESTATUS[0]}
    set -e
    
    if [ ${EXEC_LIST_CODE} -eq 0 ] && [ -n "${EXEC}" ]; then
      echo "  ✓ Execution ID found: ${EXEC}"
      break
    fi
    
    if [ ${retry} -lt 10 ]; then
      echo "  Retry ${retry}/10: waiting for execution to appear..."
      sleep 2
    fi
  done
fi

if [ -z "${EXEC}" ]; then
  echo "❌ Error: Could not determine execution ID"
  echo "  Original output:"
  echo "${EXEC_OUTPUT}" | head -20
  echo ""
  echo "  Try manually:"
  echo "    gcloud run jobs executions list --job ${JOB} --region ${REGION} --project ${PROJECT_ID}"
  exit 1
fi

echo "  Execution ID: ${EXEC}"
echo ""

# ポーリングで完了を待機
echo "⏳ Waiting for migration to complete..."
echo "  This may take several minutes. Status updates every 5 seconds."
echo ""

START_TS=$(date +%s)
MAX_WAIT_SECONDS=900
POLL_INTERVAL=5
ITERATION=0
MAX_ITERATIONS=$((MAX_WAIT_SECONDS / POLL_INTERVAL))

while [ ${ITERATION} -lt ${MAX_ITERATIONS} ]; do
  ITERATION=$((ITERATION + 1))
  
  # Execution の状態を取得
  set +e
  DESCRIBE_OUTPUT=$(gcloud run jobs executions describe "${EXEC}" \
    --region "${REGION}" \
    --project "${PROJECT_ID}" \
    --format=json 2>&1)
  DESCRIBE_CODE=${PIPESTATUS[0]}
  set -e
  
  if [ ${DESCRIBE_CODE} -ne 0 ]; then
    echo "⚠ Warning: Failed to describe execution (attempt ${ITERATION}/${MAX_ITERATIONS})"
    echo "  Error: ${DESCRIBE_OUTPUT}" | head -3
    sleep ${POLL_INTERVAL}
    continue
  fi
  
  # JSON をパース
  COMPLETED=$(printf "%s" "${DESCRIBE_OUTPUT}" | jq -r '( .status.conditions[]? | select(.type=="Completed") | .status ) // ""' 2>/dev/null || echo "")
  TASKS=$(printf "%s" "${DESCRIBE_OUTPUT}" | jq -r '(.spec.taskCount // 0)' 2>/dev/null || echo "0")
  SUCCEEDED=$(printf "%s" "${DESCRIBE_OUTPUT}" | jq -r '(.status.succeededCount // 0)' 2>/dev/null || echo "0")
  FAILED=$(printf "%s" "${DESCRIBE_OUTPUT}" | jq -r '(.status.failedCount // 0)' 2>/dev/null || echo "0")
  RUNNING=$(printf "%s" "${DESCRIBE_OUTPUT}" | jq -r '(.status.runningCount // 0)' 2>/dev/null || echo "0")
  
  NOW=$(date +%s)
  ELAPSED=$((NOW - START_TS))
  
  # ステータスを表示
  printf "  [%3ds] iteration=%3d | completed=%s | tasks=%s | succeeded=%s | failed=%s | running=%s\n" \
    "${ELAPSED}" "${ITERATION}" "${COMPLETED:-unknown}" "${TASKS:-0}" "${SUCCEEDED:-0}" "${FAILED:-0}" "${RUNNING:-0}"
  
  # 完了判定
  if [ "${COMPLETED}" = "True" ]; then
    echo ""
    echo "✓ Migration completed successfully"
    break
  fi
  
  # 失敗判定
  if [ "${FAILED}" != "0" ]; then
    echo ""
    echo "❌ Error: Migration failed"
    echo "  Execution: ${EXEC}"
    echo "  Failed tasks: ${FAILED}/${TASKS}"
    echo ""
    echo "  Full execution details:"
    echo "${DESCRIBE_OUTPUT}" | jq '.' 2>/dev/null || echo "${DESCRIBE_OUTPUT}"
    echo ""
    echo "  View logs:"
    echo "    gcloud run jobs executions describe ${EXEC} --region ${REGION} --project ${PROJECT_ID}"
    exit 1
  fi
  
  # 全タスク成功判定
  if [ "${TASKS}" != "0" ] && [ "${SUCCEEDED}" = "${TASKS}" ]; then
    echo ""
    echo "✓ Migration completed successfully (all tasks succeeded)"
    break
  fi
  
  # タイムアウトチェック
  if [ ${ELAPSED} -ge ${MAX_WAIT_SECONDS} ]; then
    echo ""
    echo "❌ Error: Migration timed out after ${MAX_WAIT_SECONDS} seconds"
    echo "  Execution: ${EXEC}"
    echo "  Final status:"
    echo "    Tasks: ${TASKS}"
    echo "    Succeeded: ${SUCCEEDED}"
    echo "    Failed: ${FAILED}"
    echo "    Running: ${RUNNING}"
    echo "    Completed: ${COMPLETED}"
    echo ""
    echo "  Full execution details:"
    echo "${DESCRIBE_OUTPUT}" | jq '.' 2>/dev/null || echo "${DESCRIBE_OUTPUT}"
    echo ""
    echo "  Check manually:"
    echo "    gcloud run jobs executions describe ${EXEC} --region ${REGION} --project ${PROJECT_ID}"
    exit 1
  fi
  
  sleep ${POLL_INTERVAL}
done

# 最終確認
echo ""
echo "🔍 Final status check..."
set +e
FINAL_DESCRIBE=$(gcloud run jobs executions describe "${EXEC}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --format=json 2>&1)
FINAL_CODE=${PIPESTATUS[0]}
set -e

if [ ${FINAL_CODE} -eq 0 ]; then
  FINAL_FAILED=$(printf "%s" "${FINAL_DESCRIBE}" | jq -r '(.status.failedCount // 0)' 2>/dev/null || echo "0")
  FINAL_SUCCEEDED=$(printf "%s" "${FINAL_DESCRIBE}" | jq -r '(.status.succeededCount // 0)' 2>/dev/null || echo "0")
  FINAL_TASKS=$(printf "%s" "${FINAL_DESCRIBE}" | jq -r '(.spec.taskCount // 0)' 2>/dev/null || echo "0")
  
  echo "  Final status:"
  echo "    Tasks: ${FINAL_TASKS}"
  echo "    Succeeded: ${FINAL_SUCCEEDED}"
  echo "    Failed: ${FINAL_FAILED}"
  
  if [ "${FINAL_FAILED}" != "0" ]; then
    echo ""
    echo "❌ Error: Migration has failed tasks"
    echo "  Execution: ${EXEC}"
    echo ""
    echo "  Full execution details:"
    echo "${FINAL_DESCRIBE}" | jq '.' 2>/dev/null || echo "${FINAL_DESCRIBE}"
    exit 1
  fi
  
  if [ "${FINAL_TASKS}" != "0" ] && [ "${FINAL_SUCCEEDED}" = "${FINAL_TASKS}" ]; then
    echo ""
    echo "✓ Migration completed successfully"
    echo "  Execution: ${EXEC}"
    exit 0
  fi
else
  echo "⚠ Warning: Could not get final status"
  echo "  Error: ${FINAL_DESCRIBE}" | head -3
  echo ""
  echo "  However, migration appears to have completed based on polling"
  echo "  Check manually:"
  echo "    gcloud run jobs executions describe ${EXEC} --region ${REGION} --project ${PROJECT_ID}"
fi

echo ""
echo "✓ Migration job execution completed"
echo "  Execution: ${EXEC}"
echo "  Job: ${JOB}"
echo "  Project: ${PROJECT_ID}"
echo "  Region: ${REGION}"

