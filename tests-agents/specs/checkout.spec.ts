import { test, expect, seedCart } from '../fixtures/auth';

/**
 * 模块五 · 结账
 * 覆盖：CHK-01/02/03/06(P0) + CHK-04(P1)。
 * 跳过 P2：CHK-08。CHK-07/09（缺陷类）见 risks.spec.ts。
 *
 * 表单为 novalidate，全部校验由页面 JS 处理，空提交也会进入 JS 并报字段错误。
 */
test.describe('模块五 · 结账', () => {
  test('CHK-01 [P0] 空车阻止结账，不渲染表单', async ({ loggedIn: page }) => {
    await seedCart(page, []);
    await page.goto('/checkout.html');

    await expect(page.getByText('购物车是空的，无法结账')).toBeVisible();
    await expect(page.getByRole('form', { name: '结账表单' })).toHaveCount(0);
  });

  test('CHK-02 [P0] 全部留空提交：四处字段错误且不下单', async ({ loggedIn: page }) => {
    await seedCart(page, [{ id: 'b001', qty: 1 }]);
    await page.goto('/checkout.html');

    await page.getByRole('button', { name: '提交订单' }).click();

    await expect(page.getByText('姓名至少 2 个字')).toBeVisible();
    await expect(page.getByText('请输入有效邮箱')).toBeVisible();
    await expect(page.getByText('地址至少 5 个字')).toBeVisible();
    await expect(page.getByText('请选择支付方式')).toBeVisible();
    // 未跳成功页
    await expect(page.getByText('下单成功 🎉')).toBeHidden();
  });

  test('CHK-03 [P0] 邮箱格式错误：邮箱字段报错且不下单', async ({ loggedIn: page }) => {
    await seedCart(page, [{ id: 'b001', qty: 1 }]);
    await page.goto('/checkout.html');

    await page.getByLabel('收件人姓名').fill('张三');
    await page.getByLabel('邮箱').fill('not-an-email');
    await page.getByLabel('收货地址').fill('北京市海淀区某街道 1 号');
    await page.getByRole('radio', { name: '支付宝' }).check();
    await page.getByRole('button', { name: '提交订单' }).click();

    await expect(page.getByText('请输入有效邮箱')).toBeVisible();
    await expect(page.getByText('下单成功 🎉')).toBeHidden();
  });

  test('CHK-04 [P1] 姓名<2 / 地址<5：对应字段报长度错误且不下单', async ({ loggedIn: page }) => {
    await seedCart(page, [{ id: 'b001', qty: 1 }]);
    await page.goto('/checkout.html');

    await page.getByLabel('收件人姓名').fill('A');
    await page.getByLabel('邮箱').fill('alice@example.com');
    await page.getByLabel('收货地址').fill('abc');
    await page.getByRole('radio', { name: '微信' }).check();
    await page.getByRole('button', { name: '提交订单' }).click();

    await expect(page.getByText('姓名至少 2 个字')).toBeVisible();
    await expect(page.getByText('地址至少 5 个字')).toBeVisible();
    await expect(page.getByText('下单成功 🎉')).toBeHidden();
  });

  test('CHK-06 [P0] 合法信息下单成功：出订单号、购物车清空、计数归 0', async ({ loggedIn: page }) => {
    await seedCart(page, [{ id: 'b001', qty: 2 }]);
    await page.goto('/checkout.html');

    await page.getByLabel('收件人姓名').fill('张三');
    await page.getByLabel('邮箱').fill('alice@example.com');
    await page.getByLabel('收货地址').fill('北京市海淀区某街道 1 号');
    await page.getByRole('radio', { name: '支付宝' }).check();
    await page.getByRole('button', { name: '提交订单' }).click();

    // 业务状态：成功页 + 订单号 ORDxxx + 购物车清空
    await expect(page.getByRole('heading', { name: '下单成功 🎉' })).toBeVisible();
    await expect(page.getByText(/^ORD\d+$/)).toBeVisible();
    await expect(page.getByRole('link', { name: '购物车 (0)' })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('cart'))).toBeNull();
  });
});
