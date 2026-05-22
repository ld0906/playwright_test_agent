#!/usr/bin/env bash
# Playwright Test Agents 半自动工作流
# 用法：bash run-agents.sh
#
# 设计原则：
# - 不做真正的"一键全跑"。每一步都停下来等人 review
# - 完全自动化会让"测试人审查 AI 产出"这个核心机制失效
# - 这个脚本只是把"该停的地方都标记出来"的工作流引导

set -e

ROOT=$(cd "$(dirname "$0")/../../.." && pwd)
SEED="$ROOT/seed.md"
PLAN="$ROOT/test-plans/mini-bookstore-plan.md"
SPECS_DIR="$ROOT/tests-agents/specs"

cyan() { printf "\033[36m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }
red() { printf "\033[31m%s\033[0m\n" "$1"; }

pause() {
  yellow "→ $1"
  read -p "  完成后回车继续，Ctrl+C 中止：" _
}

# ──── 前置检查 ────
cyan "==== 0. 前置检查 ===="

if [ ! -f "$SEED" ]; then
  red "缺少 seed.md，请先完成 ep03"
  exit 1
fi

if ! curl -s -o /dev/null http://localhost:5173/ 2>/dev/null && \
   ! command -v curl > /dev/null; then
  yellow "无法 curl 检测 demo-app。请手动确认 http://localhost:5173 已打开"
fi

cyan "  ✓ seed.md 就位：$SEED"
echo

# ──── 1. 决策：要不要更新 seed ────
cyan "==== 1. 决策：本次变更是不是业务规则变了？ ===="
echo "   是 → 现在请你打开 seed.md 更新业务规则段落"
echo "   否 → 直接回车跳过"
pause "（更新 seed.md 或回车跳过）"

# ──── 2. Planner ────
cyan "==== 2. Planner（如有需求变更）===="
echo "   去 Claude Code 粘贴 ep03 的 Planner prompt（指向 seed.md）"
echo "   产物：$PLAN"
pause "（Planner 跑完、test-plan 更新好后回车）"

if [ ! -f "$PLAN" ]; then
  red "$PLAN 不存在，Planner 没跑完吗？"
  exit 1
fi

# ──── 3. 人工 review test-plan ────
cyan "==== 3. 人工 review test-plan ===="
echo "   打开 $PLAN，按 SOP 检查："
echo "     • P0 是否覆盖业务关键路径"
echo "     • 风险用例小节是否漏了什么"
echo "     • 疑似 bug 是否准确"
pause "（review 完回车）"

# ──── 4. Generator ────
cyan "==== 4. Generator（如有新用例）===="
echo "   去 Claude Code 粘贴 ep04 的 Generator prompt（带 7 条约束）"
echo "   产物：$SPECS_DIR/"
pause "（Generator 跑完、specs 都写出来后回车）"

# ──── 5. 跑测试 ────
cyan "==== 5. 跑测试 ===="
cd "$ROOT/tests-agents"
set +e
npx playwright test
TEST_EXIT=$?
set -e

if [ $TEST_EXIT -eq 0 ]; then
  cyan "✅ 全部通过（含 RISK 的 test.fail 预期失败）"
  echo
  cyan "==== 工作流完成 ===="
  exit 0
fi

# ──── 6. Healer（如有失败）────
red "==== 6. 有用例失败，进入 Healer 流程 ===="
echo
echo "请先判断失败类型："
echo "  • 真 bug → 在 risks.spec.ts 加 test.fail() 标记进基线"
echo "  • UI 微调（文案/位置）→ 用 Healer 守门 prompt 修"
echo "  • form input name / API 字段变化 → 不要让 Healer 修，找开发确认"
echo
echo "守门 prompt：ep06-healer/code/healer-prompt.md"
pause "（在 Claude Code 用守门 prompt 跑 Healer，回车继续）"

# ──── 7. 再跑一次验证 ────
cyan "==== 7. Healer 修完，再跑一次验证 ===="
npx playwright test
echo
cyan "==== 工作流完成 ===="
