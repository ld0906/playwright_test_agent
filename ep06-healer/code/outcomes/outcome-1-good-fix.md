# Healer 结局 1：✅ 修对了

> 场景：应用了 Broken A（按钮文案 "加入购物车" → "立即购买"）
> 失败用例：cart.spec.ts 多条
> Healer 行为：识别意图，更新 locator

---

## Healer 的修改 diff

```diff
- await page.getByRole('button', { name: '加入购物车' }).click();
+ await page.getByRole('button', { name: '立即购买' }).click();
```

## Healer 的解释

> 失败原因：`getByRole('button', { name: '加入购物车' })` 找不到元素。
> DOM 检查显示该按钮现在的可访问名是"立即购买"。
> 这是一次明确的文案重命名，业务意图（点击触发加车动作）未变。
> 我把 locator 文案同步更新。

## 为什么这次是"修对了"

- **意图明确**：按钮位置、ID、行为均未变，只是显示文本变了
- **断言未受影响**：`expect(cartCount).toHaveText('1')` 仍然有效，业务行为被验证
- **可解释**：Healer 写了清楚的修改原因，PR 能正常 review

## 你（讲师）要让学员看到

跑 `npx playwright test` 应该再次全绿。Healer 没绕过测试，没改断言强度，只改了 locator 的"名字"。

这是 Healer 最理想的工作场景：**UI 表层变了，业务底层没变**。
