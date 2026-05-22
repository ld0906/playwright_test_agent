// ✅ 改写版本：三关全过
// 复用 fixture / user-facing locator / web-first assertion / 业务断言

import { test, expect } from '../../../ep04-generator/code/fixtures/auth';

test('详情页加车后，购物车计数 +1 且购物车里有对应书', async ({ loggedIn: page }) => {
  await page.goto('/book.html?id=b001');
  await expect(page.getByRole('heading', { name: '重构：改善既有代码的设计' })).toBeVisible();

  await page.getByRole('button', { name: '加入购物车' }).click();

  // ✅ 业务状态断言：顶栏计数 + 购物车里真有这本书
  await expect(page.locator('#cart-count')).toHaveText('1');

  await page.goto('/cart.html');
  await expect(page.locator('.cart-row')).toHaveCount(1);
  await expect(page.locator('.cart-row').first()).toContainText('重构');
});
