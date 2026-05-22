# 场景 A：新增业务功能——"购物车一键清空"

> 模拟真实需求变更，走完 Planner + Generator 两个 agent。
> 不涉及 Healer，因为现有 spec 不会挂。

---

## 1. 需求描述（产品同学给的）

> 用户反馈购物车里有时会塞太多书，希望提供一个"清空购物车"按钮，
> 一键删除所有商品。点击后弹确认对话框，二次确认后才真删。

---

## 2. 业务规则梳理（测试负责人加进 seed.md）

在 `seed.md` 的"3.3 购物车"段落末尾追加：

```markdown
- **批量清空**：购物车页面顶部提供"清空购物车"按钮
  - 必须二次确认（弹 confirm 对话框）
  - 确认后所有商品被移除，顶栏计数归 0
  - 取消后购物车保持原样
  - 空购物车状态不显示"清空"按钮
```

---

## 3. Planner 增量探索

进 Claude Code，prompt：

```
你扮演 Playwright Test Agents 中的 Planner Agent。

我刚在 seed.md 的"3.3 购物车"末尾追加了"批量清空"业务规则。
请只针对这条新规则做增量探索（不要重写整份 test-plan）。

请：
1. 通过 MCP 浏览器实际点击新功能
2. 在 test-plans/mini-bookstore-plan.md 的"购物车"小节追加新用例
3. 涉及确认对话框、取消、空购物车隐藏按钮等边界要覆盖

注意：如果应用还没实现这个按钮，请明确报告"功能未实现"，不要凭空写用例。
```

**预期产出**（追加到 plan）：

```
### TC-22 [P0] 点击清空购物车按钮弹出确认对话框
### TC-23 [P0] 确认清空后所有商品移除且顶栏计数归 0
### TC-24 [P1] 取消清空后购物车保持原样
### TC-25 [P1] 空购物车状态不显示"清空"按钮
```

---

## 4. 开发同学实现完功能后再跑 Planner

第一次跑时 Planner 应该会说"功能未实现"。这是好事。

开发同学实现后，再跑一次 Planner（同 prompt），让它真去探索。

---

## 5. Generator 增量生成

```
你扮演 Generator Agent。

test-plans/mini-bookstore-plan.md 里新增了 TC-22 到 TC-25 四条用例。
请只为这 4 条用例生成 Playwright spec，追加到 tests-agents/specs/cart.spec.ts 末尾的 describe block 里。

遵守 7 条强约束（同 ep04）。
特别注意：confirm() 对话框用 page.on('dialog', ...) 处理。
```

**预期产出**（追加到 cart.spec.ts）：

```typescript
test.describe('购物车 · 批量清空', () => {
  test.beforeEach(async ({ loggedIn: page }) => {
    // 准备 2 件商品
    await page.goto('/book.html?id=b001');
    await page.getByRole('button', { name: '加入购物车' }).click();
    await page.goto('/book.html?id=b002');
    await page.getByRole('button', { name: '加入购物车' }).click();
    await page.goto('/cart.html');
  });

  test('TC-22 [P0] 清空按钮弹出确认对话框', async ({ loggedIn: page }) => {
    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });
    await page.getByRole('button', { name: '清空购物车' }).click();
    expect(dialogMessage).toContain('确认');
  });

  test('TC-23 [P0] 确认清空后商品全部移除', async ({ loggedIn: page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: '清空购物车' }).click();
    await expect(page.locator('.cart-row')).toHaveCount(0);
    await expect(page.locator('#cart-count')).toHaveText('0');
  });

  // TC-24 / TC-25 类似
});
```

---

## 6. 跑测试 + 进 CI

```bash
cd tests-agents
npx playwright test specs/cart.spec.ts
```

通过 → PR 合并。这次工作流**没有用到 Healer**——因为我们做的是"新增"，不是"修改 UI"。

---

## 学习要点

- **新需求走 Planner + Generator，不走 Healer**
- Planner 第一次跑可以叫它"未实现就报告"，避免它凭空补用例
- Generator 增量生成时要明确"只为新用例生成"，否则它会重写整个文件
