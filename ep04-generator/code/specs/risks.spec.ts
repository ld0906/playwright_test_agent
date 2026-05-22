import { test, expect } from '../fixtures/auth';

/**
 * 风险用例：把 Planner 探索发现的疑似 bug 固化为回归基线。
 * RISK-02 当前预期失败——bug 修复后这个用例会自动转为通过，
 * 此时把 test.fail() 去掉即可。这是 Test Agents 工作流的关键习惯。
 */

test.describe('风险用例 · 业务规则边界', () => {
  test('RISK-02 [P0] 已下架书不应能加入购物车', async ({ loggedIn: page }) => {
    test.fail(true, '已知 bug：discontinued 校验缺失，跟踪在 ISSUE-001');

    await page.goto('/book.html?id=b003');
    await expect(page.getByText('⚠️ 已下架')).toBeVisible();

    const addBtn = page.getByRole('button', { name: '加入购物车' });
    await addBtn.click();

    // 期望行为：拒绝加入购物车（按钮禁用、提示拒绝、或购物车数为 0）
    await expect(page.locator('#cart-count')).toHaveText('0');
  });

  test('RISK-03 [P0] 库存为 0 的书不应能加入购物车', async ({ loggedIn: page }) => {
    test.fail(true, '已知 bug：库存校验缺失，与 RISK-02 同根');

    await page.goto('/book.html?id=b007');
    await page.getByRole('button', { name: '加入购物车' }).click();
    await expect(page.locator('#cart-count')).toHaveText('0');
  });

  test('RISK-04 [P0] 空购物车不能进入结账', async ({ loggedIn: page }) => {
    await page.goto('/checkout.html');
    await expect(page.getByText('购物车是空的，无法结账')).toBeVisible();
    await expect(page.getByRole('button', { name: '提交订单' })).toBeHidden();
  });
});
