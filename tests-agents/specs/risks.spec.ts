import { test, expect, seedCart } from '../fixtures/auth';

/**
 * 风险用例（对应测试计划「风险用例小节」与缺陷汇总）。
 *
 * 这里的用例统一断言「正确的业务行为」。其中若干条对应应用现存缺陷，
 * 当前实现必然违反，故用 test.fail() 标记为「预期失败」：
 *   - 应用未修复时：用例失败 → 被记为 expected failure，整体不阻塞。
 *   - 应用修复后：用例转为通过 → test.fail() 会把它标红，提醒移除标记。
 *
 * 预期失败用例使用较短的断言超时，避免无谓等待。
 */
test.describe('风险用例', () => {
  // R1 越界风险 —— 当前通过
  test('RISK-01 [P0] 未登录访问结账页必须跳回登录页', async ({ page }) => {
    await page.goto('/checkout.html');
    await expect(page).toHaveURL(/\/login\.html$/);
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
  });

  // R2-1 / R2-2 业务规则误判 —— 预期失败
  test('RISK-02 [P0] 已下架/库存为0的书必须禁止加入购物车', async ({ loggedIn: page }) => {
    // ISSUE-001：book.html 的加车处理完全没有 discontinued / stock 校验，
    // 下架且库存为 0 的 b003 仍能被加入购物车（顶栏计数变为 1）。
    // 正确行为应是「拒绝加入、计数保持 0」。当前实现违反业务规则 3.2，标记预期失败。
    test.fail();
    await page.goto('/book.html?id=b003');
    await expect(page.getByText('⚠️ 已下架')).toBeVisible(); // 确认确为下架书

    await page.getByRole('button', { name: '加入购物车' }).click();

    // 正确行为：下架书不应进入购物车
    await expect(page.getByRole('link', { name: '购物车 (0)' })).toBeVisible({ timeout: 3000 });
  });

  // R2-3 数量超库存 —— 预期失败（BUG-03）
  test('RISK-03 [P1] 购物车数量不得超过库存上限', async ({ loggedIn: page }) => {
    // BUG-03：购物车 + 按钮无库存上限约束，可一直累加。
    // b004 库存 5，从 5 再点一次「增加」应被约束在 5。当前实现会变成 6。
    test.fail();
    await seedCart(page, [{ id: 'b004', qty: 5 }]); // 库存 5，已到上限
    await page.goto('/cart.html');

    const row = page.getByRole('listitem').filter({ hasText: '深入理解计算机系统' });
    await row.getByRole('button', { name: '增加' }).click();

    // 正确行为：受库存上限约束，数量仍为 5
    await expect(row.getByText('5', { exact: true })).toBeVisible({ timeout: 3000 });
  });

  // R3-3 纯空格绕过校验 —— 预期失败（BUG-04）
  test('RISK-04 [P1] 纯空白字符不得绕过姓名/地址校验', async ({ loggedIn: page }) => {
    // BUG-04：长度校验按字符数（含空格）计算，姓名 2 空格、地址 5 空格被判合法并下单成功。
    test.fail();
    await seedCart(page, [{ id: 'b001', qty: 1 }]);
    await page.goto('/checkout.html');

    await page.getByLabel('收件人姓名').fill('  ');      // 2 个空格
    await page.getByLabel('邮箱').fill('alice@example.com');
    await page.getByLabel('收货地址').fill('     ');     // 5 个空格
    await page.getByRole('radio', { name: '支付宝' }).check();
    await page.getByRole('button', { name: '提交订单' }).click();

    // 正确行为：纯空白应被判无效，不应出现成功页
    await expect(page.getByRole('heading', { name: '下单成功 🎉' })).toBeHidden({ timeout: 3000 });
  });
});
