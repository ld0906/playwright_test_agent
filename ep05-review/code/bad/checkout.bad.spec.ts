// ❌ 第二份偷工减料样本：断言只看"出现提示"，没看业务结果
// 这种脚本最危险——绿得很，但 bug 漏过去你不知道

import { test, expect } from '@playwright/test';

test('结账成功', async ({ page }) => {
  await page.goto('http://localhost:5173/login.html');
  await page.fill('input[name="username"]', 'alice');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  await page.goto('http://localhost:5173/book.html?id=b001');
  await page.click('#add-to-cart');

  await page.goto('http://localhost:5173/checkout.html');
  await page.fill('input[name="name"]', '张三');
  await page.fill('input[name="email"]', 'bad-email');         // ❌ 故意填错
  await page.fill('input[name="address"]', '北京某街 1 号');
  await page.click('input[value="alipay"]');
  await page.click('button[type="submit"]');

  // ❌ 错位断言：用例叫"结账成功"，但断言只是"看到下单成功 heading 或 错误提示"
  //    这个或断言永远为真，bug 漏不漏都绿
  await expect(
    page.getByRole('heading', { name: '下单成功 🎉' })
      .or(page.locator('.field-error'))
  ).toBeVisible();
});
