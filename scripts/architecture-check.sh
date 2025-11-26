#!/bin/bash
set -euo pipefail

# Options:
#  - CI=true or CI_MODE=1 : 簡素(機械可読寄り)出力
#  - NO_COLOR: 色無し
#  - SKIP_FSD=1 / SKIP_DEPS=1 / SKIP_DC=1 / SKIP_GUARDS=1 / SKIP_KNIP=1 : 各チェックをスキップ

if [ "${CI:-}" = "true" ] || [ "${CI_MODE:-0}" = "1" ]; then PRETTY=0; else PRETTY=1; fi
if [ -n "${NO_COLOR:-}" ] || [ "$PRETTY" = "0" ] || [ ! -t 1 ]; then
  RED=""; GREEN=""; YELLOW=""; BLUE=""; NC="";
else
  RED="\033[31m"; GREEN="\033[32m"; YELLOW="\033[33m"; BLUE="\033[34m"; NC="\033[0m";
fi

# FAST=1 のとき、重いチェックはデフォルトでスキップ（手動で上書き可能）
if [ "${FAST:-0}" = "1" ]; then
  : "${SKIP_KNIP:=1}"
  : "${SKIP_DEPS:=1}"
  : "${SKIP_DC:=1}"
fi

emoji() { [ "$PRETTY" = "1" ] && printf "%s " "$1" || true; }
heading() { emoji "🔍"; printf "%b%s%b\n" "$BLUE" "$1" "$NC"; }
ok() { emoji "✅"; printf "%b%s%b\n" "$GREEN" "$1" "$NC"; }
warn() { emoji "⚠️"; printf "%b%s%b\n" "$YELLOW" "$1" "$NC"; }
err() { emoji "❌"; printf "%b%s%b\n" "$RED" "$1" "$NC"; }

ROOT_DIR="$(cd -- "$(dirname "$0")/.." >/dev/null 2>&1 ; pwd -P)"
cd "$ROOT_DIR"

heading "アーキテクチャ / FSD チェック開始..."

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
      case "$name" in
        *ガード*|*guard*)
          # ガードは違反メッセージ（「違反:」を含む行）とその後の行を表示
          if grep -q "違反:" "$OUT" 2>/dev/null; then
            # 「違反:」を含む行と、その後の30行を表示（違反箇所のリストを含む）
            # 違反メッセージの行には•を付け、違反箇所のリスト（既に•が付いている）はそのまま
            grep -A 30 "違反:" "$OUT" | while IFS= read -r line; do
              if [[ "$line" =~ ^違反: ]]; then
                echo "  • $line"
              elif [[ "$line" =~ ^[[:space:]]*• ]]; then
                # 既に•が付いている行はそのまま表示（インデントは既に適切）
                echo "  $line"
              else
                echo "  $line"
              fi
            done
          else
            # 違反メッセージが見つからない場合は、末尾100行を表示
            tail -n 100 "$OUT" | sed -e 's/^/  • /'
          fi
          ;;
        *)
          # 重要行だけダイジェスト
          { grep -E "(ERROR|Error|error|✖|failed|violation)" "$OUT" || true; } | head -n 10 | sed -e 's/^/  • /'
          ;;
      esac
      { tail -n 20 "$ERR" || true; } | sed -e 's/^/  • /'
    fi
    FAIL=1
  fi
  rm -f "$OUT" "$ERR"
}

# 1) FSD (steiger)
if [ "${SKIP_FSD:-0}" != "1" ]; then
  run_step "FSD (steiger)" bun run arch:fsd
else
  warn "FSD チェックは SKIP_FSD=1 によりスキップ"
fi

# 2) 依存 (madge)
if [ "${SKIP_DEPS:-0}" != "1" ]; then
  run_step "依存(循環/孤立)" bun run arch:deps
else
  warn "依存チェックは SKIP_DEPS=1 によりスキップ"
fi

# 3) 依存規約 (dependency-cruiser)
if [ "${SKIP_DC:-0}" != "1" ]; then
  run_step "依存規約(dependency-cruiser)" bun run arch:dc
else
  warn "依存規約チェックは SKIP_DC=1 によりスキップ"
fi

# 4) ガード (構文/配置)
if [ "${SKIP_GUARDS:-0}" != "1" ]; then
  run_step "構文/配置ガード" bash scripts/arch-guards.sh
else
  warn "ガードチェックは SKIP_GUARDS=1 によりスキップ"
fi

# 5) 未使用 (knip)
if [ "${SKIP_KNIP:-0}" != "1" ]; then
  run_step "未使用(knip)" bun run arch:knip
else
  warn "未使用チェックは SKIP_KNIP=1 によりスキップ"
fi

if [ "$FAIL" = "0" ]; then
  ok "すべてのアーキテクチャチェックに成功しました"
  exit 0
else
  err "アーキテクチャチェックに失敗しました"
  exit 1
fi


