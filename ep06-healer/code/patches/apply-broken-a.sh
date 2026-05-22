#!/usr/bin/env bash
# Broken A：按钮文案改名
# 把 "加入购物车" → "立即购买"
# 业务背景：产品同学说"加入购物车"转化率低，改成"立即购买"试试
# 风险：locator 用 button name 命中的所有 spec 都会挂
#
# 这是一种"低风险"破坏：意图明确，Healer 应该正确修复

set -e
cd "$(dirname "$0")/../../../demo-app"

if ! git diff-index --quiet HEAD --; then
  echo "❌ demo-app 有未提交修改，先 commit 或 stash"
  exit 1
fi

git checkout -b broken-a-rename-button 2>/dev/null || git checkout broken-a-rename-button

sed -i.bak 's/加入购物车/立即购买/g' public/book.html
rm public/book.html.bak

git add public/book.html
git commit -m "feat(ux): rename '加入购物车' to '立即购买' for conversion test"

echo "✅ Broken A 已应用"
echo "   现在去 tests-agents 跑 npx playwright test，应该会看到 cart/checkout 相关 spec 失败"
echo "   还原：cd demo-app && git checkout main"
