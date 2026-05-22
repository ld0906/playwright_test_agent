#!/usr/bin/env bash
# Broken B：登录字段 name 属性改名
# 把 input[name="username"] → input[name="userId"]
# 但 label 文字仍然是"用户名"
# 业务背景（伪）：后端字段 rename，前端跟着改
# 真实情况：这是一次有歧义的 refactor——
#   - 用 getByLabel('用户名') 的脚本不会挂（因为 label 没变）
#   - 用 input[name="username"] 的脚本会挂
#   - 但实际上后端可能没改，这次 rename 可能本身就是 bug
#
# 这是一种"高风险"破坏：Healer 如果机械修复，会把 bug 掩盖掉

set -e
cd "$(dirname "$0")/../../../demo-app"

if ! git diff-index --quiet HEAD --; then
  echo "❌ demo-app 有未提交修改，先 commit 或 stash"
  exit 1
fi

git checkout -b broken-b-rename-field 2>/dev/null || git checkout broken-b-rename-field

# 改 input name，保留 label 文字
sed -i.bak 's/name="username"/name="userId"/' public/login.html
rm public/login.html.bak

# 关键：还要改登录 JS 逻辑里的字段读取
sed -i.bak "s/fd.get('username')/fd.get('userId')/" public/login.html
rm public/login.html.bak

git add public/login.html
git commit -m "refactor(auth): rename field 'username' to 'userId'"

echo "✅ Broken B 已应用"
echo "   特别注意：getByLabel('用户名') 仍能命中输入框，但 input[name] 的 spec 挂掉"
echo "   还原：cd demo-app && git checkout main"
