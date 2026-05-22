import { test, expect } from '../fixtures/auth';

test.describe('结账', () => {
  test.beforeEach(async ({ loggedIn: page }) => {
    await page.goto('/book.html?id=b001');
    await page.getByRole('button', { name: '加入购物车' }).click();
    await page.goto('/checkout.html');
  });

  test('TC-17 [P0] 全部填写正确后下单成功并清空购物车', async ({ loggedIn: page }) => {
    await page.getByLabel('收件人姓名').fill('张三');
    await page.getByLabel('邮箱').fill('zhangsan@example.com');
    await page.getByLabel('收货地址').fill('北京市朝阳区某街 1 号');
    await page.getByLabel('支付宝').check();
    await page.getByRole('button', { name: '提交订单' }).click();

    await expect(page.getByRole('heading', { name: '下单成功 🎉' })).toBeVisible();
    await expect(page.locator('#order-id')).toContainText('ORD');
    await expect(page.locator('#cart-count')).toHaveText('0');
  });

  test('TC-18 [P0] 邮箱格式错误被拦截，不跳转成功页', async ({ loggedIn: page }) => {
    await page.getByLabel('收件人姓名').fill('张三');
    await page.getByLabel('邮箱').fill('not-an-email');
    await page.getByLabel('收货地址').fill('北京市朝阳区某街 1 号');
    await page.getByLabel('支付宝').check();
    await page.getByRole('button', { name: '提交订单' }).click();

    await expect(page.locator('[data-for="email"]')).toHaveText('请输入有效邮箱');
    await expect(page.getByRole('heading', { name: '下单成功 🎉' })).toBeHidden();
  });

  test('TC-19 [P1] 姓名小于 2 字被拦截', async ({ loggedIn: page }) => {
    await page.getByLabel('收件人姓名').fill('a');
    await page.getByLabel('邮箱').fill('zhangsan@example.com');
    await page.getByLabel('收货地址').fill('北京市朝阳区某街 1 号');
    await page.getByLabel('支付宝').check();
    await page.getByRole('button', { name: '提交订单' }).click();

    await expect(page.locator('[data-for="name"]')).toHaveText('姓名至少 2 个字');
  });
});
