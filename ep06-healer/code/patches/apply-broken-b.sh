#!/usr/bin/env bash
# Broken B：登录字段 name 属性改名
# 把 input[name="username"] → input[name="userId"]
# 但 label 文字仍然是"用户名"
# 业务背景（伪）：后端字段 rename，前端跟着改
# 真实情况：这是一次有歧义的 refactor——
#   - 用 getByLabel('用户名') 的脚本不会挂（因为 label 没变）
#   - 用 input[name="username"] 的脚本会挂
#   - 注意：本脚本同时改了 JS 里的 fd.get，登录功能仍正常，
#     仅 input[name] 定位失效——所以风险在于 Healer 机械改 locator，
#     把"字段契约是否真的该变"这个判断绕过去
#
# 这是一种"高风险"破坏：Healer 如果机械修复，会把判断点掩盖掉
#
# 不依赖 git：应用前把目标文件备份成 *.healer-orig，
# 还原用：./apply-broken-b.sh restore

set -euo pipefail

DEMO_APP="$(cd "$(dirname "$0")/../../../demo-app" && pwd)"
TARGET="$DEMO_APP/public/login.html"
BACKUP="$TARGET.healer-orig"

restore() {
  if [[ -f "$BACKUP" ]]; then
    mv -f "$BACKUP" "$TARGET"
    echo "✅ 已还原 login.html"
  else
    echo "ℹ️  没有备份，无需还原（login.html 应已是原始状态）"
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
  echo "   说明 Broken B 可能已经应用过。先还原：$0 restore"
  exit 1
fi

cp "$TARGET" "$BACKUP"

# 改 input name，保留 label 文字
sed -i.bak 's/name="username"/name="userId"/' "$TARGET"
rm -f "$TARGET.bak"

# 关键：还要改登录 JS 逻辑里的字段读取
sed -i.bak "s/fd.get('username')/fd.get('userId')/" "$TARGET"
rm -f "$TARGET.bak"

echo "✅ Broken B 已应用"
echo "   特别注意：getByLabel('用户名') 仍能命中输入框，但 input[name] 的 spec 挂掉"
echo "   还原：$0 restore"
