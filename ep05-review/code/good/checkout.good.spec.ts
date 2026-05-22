// ✅ 拆成两条用例：成功路径和失败路径分开断言
// 用例名说什么，断言就只断什么

import { test, expect } from '../../../ep04-generator/code/fixtures/auth';

test.describe('结账', () => {
  test.beforeEach(async ({ loggedIn: page }) => {
    await page.goto('/book.html?id=b001');
    await page.getByRole('button', { name: '加入购物车' }).click();
    await page.goto('/checkout.html');
  });

  test('全部填写正确后下单成功并清空购物车', async ({ loggedIn: page }) => {
    await page.getByLabel('收件人姓名').fill('张三');
    await page.getByLabel('邮箱').fill('zhangsan@example.com');
    await page.getByLabel('收货地址').fill('北京市朝阳区某街 1 号');
    await page.getByLabel('支付宝').check();
    await page.getByRole('button', { name: '提交订单' }).click();

    // ✅ 三层业务断言：订单号、订单号前缀、购物车被清空
    await expect(page.getByRole('heading', { name: '下单成功 🎉' })).toBeVisible();
    await expect(page.locator('#order-id')).toContainText('ORD');
    await expect(page.locator('#cart-count')).toHaveText('0');
  });

  test('邮箱格式错误被拦截，不跳转成功页', async ({ loggedIn: page }) => {
    await page.getByLabel('收件人姓名').fill('张三');
    await page.getByLabel('邮箱').fill('bad-email');
    await page.getByLabel('收货地址').fill('北京市朝阳区某街 1 号');
    await page.getByLabel('支付宝').check();
    await page.getByRole('button', { name: '提交订单' }).click();

    // ✅ 正反两面都断：错误提示出现 + 成功页未出现
    await expect(page.locator('[data-for="email"]')).toHaveText('请输入有效邮箱');
    await expect(page.getByRole('heading', { name: '下单成功 🎉' })).toBeHidden();
  });
});
