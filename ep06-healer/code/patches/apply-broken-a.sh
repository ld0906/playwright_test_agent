#!/usr/bin/env bash
# Broken A：按钮文案改名
# 把 "加入购物车" → "立即购买"
# 业务背景：产品同学说"加入购物车"转化率低，改成"立即购买"试试
# 风险：locator 用 button name 命中的所有 spec 都会挂
#
# 这是一种"低风险"破坏：意图明确，Healer 应该正确修复
#
# 不依赖 git：应用前把目标文件备份成 *.healer-orig，
# 还原用：./apply-broken-a.sh restore

set -euo pipefail

DEMO_APP="$(cd "$(dirname "$0")/../../../demo-app" && pwd)"
TARGET="$DEMO_APP/public/book.html"
BACKUP="$TARGET.healer-orig"

restore() {
  if [[ -f "$BACKUP" ]]; then
    mv -f "$BACKUP" "$TARGET"
    echo "✅ 已还原 book.html"
  else
    echo "ℹ️  没有备份，无需还原（book.html 应已是原始状态）"
  fi
  exit 0
}

[[ "${1:-}" == "restore" || "${1:-}" == "--restore" ]] && restore

if [[ ! -f "$TARGET" ]]; then
  echo "❌ 找不到目标文件：$TARGET"
  exit 1
fi

if [[ -f "$BACKUP" ]]; then
  echo "❌ 检测到备份已存在：$BACKUP"
  echo "   说明 Broken A 可能已经应用过。先还原：$0 restore"
  exit 1
fi

cp "$TARGET" "$BACKUP"

# 只替换按钮文案（>加入购物车<），避免误伤 JS 里的 toast '已加入购物车'
sed -i.bak 's/>加入购物车</>立即购买</' "$TARGET"
rm -f "$TARGET.bak"

echo "✅ Broken A 已应用"
echo "   现在去 tests-agents 跑 npx playwright test，应该会看到 cart/checkout 相关 spec 失败"
echo "   还原：$0 restore"
