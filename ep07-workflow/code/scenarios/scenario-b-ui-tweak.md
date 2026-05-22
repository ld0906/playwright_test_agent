# 场景 B：UI 微调——"购物车页改版"

> 模拟开发同学合了一个纯 UI 改版 PR。
> 业务规则没变，只是排版和文案改了。
> 这次走 Healer，不走 Planner / Generator。

---

## 1. 变更描述（开发同学的 PR 标题）

> refactor(cart): redesign cart page with new layout

具体改动：
- "购物车" 页标题改成 "我的购物车"
- 单价和小计的视觉位置调换
- "去结账" 按钮文案改成 "去支付"
- DOM 局部嵌套加了一层 `<div class="cart-wrapper">`

---

## 2. 判断：要不要更新 seed？

**问**：业务规则有变化吗？

答：没有。还是同一套加减、移除、合计逻辑，**只是 UI 表现变了**。

**结论**：不动 seed，不跑 Planner。

---

## 3. 跑测试，看哪里挂

```bash
cd tests-agents
npx playwright test
```

预期失败：
- `TC-13 [P0] 购物车数量增减实时同步合计` —— 因为合计 locator 位置变了
- 任何用了 `'去结账'` 按钮的用例

---

## 4. 启动 Healer（用守门 prompt）

把 `ep06-healer/code/healer-prompt.md` 整段贴进 Claude Code，加一句：

```
有 3 条用例失败。请按照守门规则修复。
```

**预期 Healer 行为**：

```
TC-13 [AUTO-FIX]
  失败原因：#grand-total 定位不变，但前置 .cart-row 结构有变化
  无需修改，等待自动重试 → 已通过

"去结账" 相关 [AUTO-FIX]
  diff:
  - await page.getByRole('link', { name: '去结账' }).click();
  + await page.getByRole('link', { name: '去支付' }).click();

页面标题变化 [INFO]
  test 没断言页面 H1，不影响
```

---

## 5. Healer 应该不该做什么

✅ Healer 修了：按钮文案、链接文案
❌ Healer 没改：任何断言、任何 fixture、任何 playwright.config

如果 Healer 试图改 `.cart-wrapper` 这种结构相关的 locator，要 reject——
你的 spec 本来就该用 `getByRole`，不该依赖 wrapper class。

---

## 6. 跑测试 + 合 PR

```bash
npx playwright test
# 全绿
```

PR 合并。这次工作流**没有用到 Planner / Generator**——
因为不是新需求，也没新用例。

---

## 学习要点

- **UI 微调走 Healer，不走 Planner / Generator**
- 守门 prompt 让 Healer 主动区分"locator 修复"和"结构修复"
- 修完后人工 diff 看一眼，确认断言没被改过
- 如果 Healer 报 `[NEEDS-HUMAN]`，停下来找开发确认——这是好事，不是坏事
