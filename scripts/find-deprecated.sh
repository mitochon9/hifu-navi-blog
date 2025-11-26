#!/bin/bash
set -euo pipefail

echo "非推奨コードの検索..."

FAIL=0

echo ""
echo "1. TypeScriptコンパイラの非推奨警告を確認"
echo "----------------------------------------"
# TypeScriptコンパイラは@deprecated JSDocタグが付いたAPIを使っている場合に警告を出す
# ただし、TypeScriptコンパイラは非推奨警告をエラーとして扱わず、通常の出力に含まれない場合がある
# そのため、パターンマッチングでの補完検索も併用する
echo "TypeScriptコンパイラの警告を確認中..."
TSC_OUTPUT=$(bun run typecheck 2>&1)
if echo "$TSC_OUTPUT" | grep -iE "deprecated|非推奨|is deprecated" >/dev/null; then
  echo "  ⚠️  非推奨警告が見つかりました"
  echo "$TSC_OUTPUT" | grep -iE "deprecated|非推奨|is deprecated" | head -5 | sed 's/^/    /'
  FAIL=1
else
  echo "  ✅ 非推奨警告は見つかりませんでした"
  echo "  （注: TypeScriptコンパイラは非推奨警告をエラーとして扱わないため、"
  echo "   通常のtypecheckでは表示されない場合があります。パターンマッチングで補完します。）"
fi

echo ""
echo "2. 既知の非推奨パターンを検索"
echo "----------------------------------------"
# Zod v4の非推奨パターン
echo "ZodIssue の使用:"
if find apps packages \
  \( -path '*/node_modules/*' -o -path '*/dist/*' -o -path '*/.next/*' \) -prune -o \
  -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | \
  xargs -0 grep -nE 'ZodIssue|z\.ZodIssue' >/dev/null 2>&1; then
  echo "  ⚠️  ZodIssue の使用が見つかりました"
  find apps packages \
    \( -path '*/node_modules/*' -o -path '*/dist/*' -o -path '*/.next/*' \) -prune -o \
    -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | \
    xargs -0 grep -nE 'ZodIssue|z\.ZodIssue' || true
  FAIL=1
else
  echo "  ✅ 見つかりませんでした"
fi

echo ""
echo "Zod v4の非推奨メソッド (.email(), .url(), .datetime()):"
if find apps packages \
  \( -path '*/node_modules/*' -o -path '*/dist/*' -o -path '*/.next/*' \) -prune -o \
  -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | \
  xargs -0 grep -nE 'z\.string\(\)\.email\(\)|z\.string\(\)\.url\(\)|z\.string\(\)\.datetime\(\)' >/dev/null 2>&1; then
  echo "  ⚠️  非推奨メソッドが見つかりました"
  find apps packages \
    \( -path '*/node_modules/*' -o -path '*/dist/*' -o -path '*/.next/*' \) -prune -o \
    -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | \
    xargs -0 grep -nE 'z\.string\(\)\.email\(\)|z\.string\(\)\.url\(\)|z\.string\(\)\.datetime\(\)' || true
  FAIL=1
else
  echo "  ✅ 見つかりませんでした"
fi

echo ""
echo "Honoの非推奨API (routePath):"
if find apps packages \
  \( -path '*/node_modules/*' -o -path '*/dist/*' -o -path '*/.next/*' \) -prune -o \
  -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | \
  xargs -0 grep -nE '\.routePath|c\.req\.routePath' >/dev/null 2>&1; then
  echo "  ⚠️  routePath の使用が見つかりました"
  find apps packages \
    \( -path '*/node_modules/*' -o -path '*/dist/*' -o -path '*/.next/*' \) -prune -o \
    -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | \
    xargs -0 grep -nE '\.routePath|c\.req\.routePath' || true
  FAIL=1
else
  echo "  ✅ 見つかりませんでした"
fi

echo ""
echo "3. @deprecated JSDocタグの検索"
echo "----------------------------------------"
if find apps packages \
  \( -path '*/node_modules/*' -o -path '*/dist/*' -o -path '*/.next/*' \) -prune -o \
  -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | \
  xargs -0 grep -nE '@deprecated' >/dev/null 2>&1; then
  echo "  ⚠️  @deprecated タグが見つかりました（情報のみ）"
  find apps packages \
    \( -path '*/node_modules/*' -o -path '*/dist/*' -o -path '*/.next/*' \) -prune -o \
    -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | \
    xargs -0 grep -nE '@deprecated' || true
else
  echo "  ✅ 見つかりませんでした"
fi

echo ""
if [ "$FAIL" = "0" ]; then
  echo "✅ 検索完了: 非推奨コードは見つかりませんでした"
  exit 0
else
  echo "⚠️  検索完了: 非推奨コードが見つかりました"
  exit 1
fi

