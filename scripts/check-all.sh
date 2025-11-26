#!/bin/bash
set -euo pipefail

# push 前の統合チェック
# 環境変数:
#  - CI=true or CI_MODE=1 : 簡素(機械可読寄り)出力
#  - NO_COLOR: 色無し
#  （FAST/SKIP_TEST は廃止）
#  - TURBO_FILTER : turbo の filter（例: '...[origin/main]'）

if [ "${CI:-}" = "true" ] || [ "${CI_MODE:-0}" = "1" ]; then PRETTY=0; else PRETTY=1; fi
if [ -n "${NO_COLOR:-}" ] || [ "$PRETTY" = "0" ] || [ ! -t 1 ]; then
  RED=""; GREEN=""; YELLOW=""; BLUE=""; NC="";
else
  RED="\033[31m"; GREEN="\033[32m"; YELLOW="\033[33m"; BLUE="\033[34m"; NC="\033[0m";
fi

# 変更影響駆動の既定フィルタ（未指定時は main との差分）
: "${TURBO_FILTER:=...[origin/main]}"

emoji() { [ "$PRETTY" = "1" ] && printf "%s " "$1" || true; }
heading() { emoji "🔍"; printf "%b%s%b\n" "$BLUE" "$1" "$NC"; }
ok() { emoji "✅"; printf "%b%s%b\n" "$GREEN" "$1" "$NC"; }
warn() { emoji "⚠️"; printf "%b%s%b\n" "$YELLOW" "$1" "$NC"; }
err() { emoji "❌"; printf "%b%s%b\n" "$RED" "$1" "$NC"; }

ROOT_DIR="$(cd -- "$(dirname "$0")/.." >/dev/null 2>&1 ; pwd -P)"
cd "$ROOT_DIR"

FAIL=0

run_step() {
  local name="$1"; shift
  local cmd=("$@")
  local OUT ERR
  OUT=$(mktemp) ; ERR=$(mktemp)
  if "${cmd[@]}" >"$OUT" 2>"$ERR"; then
    ok "$name: OK"
    if [ "$PRETTY" = "1" ]; then
      tail -n 3 "$OUT" | sed -e 's/^/  • /'
    fi
  else
    err "$name: ERROR"
    if [ "$PRETTY" = "1" ]; then
      { grep -E "(ERROR|Error|error|✖|failed|violation|TS[0-9]+)" "$OUT" || true; } | head -n 10 | sed -e 's/^/  • /'
      { tail -n 20 "$ERR" || true; } | sed -e 's/^/  • /'
    fi
    FAIL=1
  fi
  rm -f "$OUT" "$ERR"
}

heading "品質チェック (lint/type/test/arch)"

# Lint & Typecheck（変更影響に限定）
run_step "Lint" bunx turbo run lint --filter="${TURBO_FILTER}"
run_step "Typecheck" bunx turbo run typecheck --filter="${TURBO_FILTER}"

# Tests（常時フル実行。DB migrate deploy を含む）
# TEST_DATABASE_URL を turbo 経由の bun test 側にも確実に伝播させる
run_step "Tests" bash -lc "dotenv -e .env -- sh -c 'cd packages/database && DATABASE_URL=\"\$TEST_DATABASE_URL\" bunx prisma migrate deploy && cd ../../ && DATABASE_URL=\"\$TEST_DATABASE_URL\" bunx turbo run test --filter=\"${TURBO_FILTER}\" --continue'"

# Architecture（フルログをそのまま表示）
heading "Architecture"

if bash scripts/architecture-check.sh; then
  :
else
  FAIL=1
fi

# 非推奨コードの検索
heading "非推奨コードの検索"

if bash scripts/find-deprecated.sh >/dev/null 2>&1; then
  ok "非推奨コード: OK"
else
  warn "非推奨コードが見つかりました（警告のみ）"
fi

if [ "$FAIL" = "0" ]; then
  ok "push 前チェックに成功しました"
  exit 0
else
  err "push 前チェックで失敗が見つかりました"
  exit 1
fi


