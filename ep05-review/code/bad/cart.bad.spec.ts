// ❌ 这是一份典型的 AI 偷工减料 spec
// 三关都翻车：locator 脆、用了 sleep、断言太浅
// 看起来能跑、能绿，但保护不了业务。

import { test, expect } from '@playwright/test';

test('加入购物车', async ({ page }) => {
  // ❌ Locator 用 CSS 长路径，结构一改就挂
  await page.goto('http://localhost:5173/login.html');
  await page.locator('input[type="text"]').fill('alice');
  await page.locator('input[type="password"]').fill('password');
  await page.locator('button').click();

  // ❌ 等待靠 sleep，flaky 之源
  await page.waitForTimeout(2000);

  await page.locator('a.book-card').first().click();
  await page.waitForTimeout(1500);

  await page.locator('#add-to-cart').click();

  // ❌ 断言只看页面元素出现，没验证业务状态
  await expect(page.locator('#add-result')).toBeVisible();
});
