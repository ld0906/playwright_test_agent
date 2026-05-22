import { test, expect, seedCart } from '../fixtures/auth';

/**
 * 模块四 · 购物车
 * 覆盖：CART-02/CART-04(P0) + CART-01/CART-03/CART-05(P1)。
 * 跳过 P2：CART-07。CART-06（库存上限缺陷）见 risks.spec.ts。
 *
 * 注：单价与行小计可能是相同金额（如 b003 价格 99、行小计也 99），
 * 故金额断言用「行内 toContainText」或唯一的「合计：¥N」，避免命中多个元素。
 */
test.describe('模块四 · 购物车', () => {
  test('CART-01 [P1] 空购物车显示空态与去逛逛链接', async ({ loggedIn: page }) => {
    await seedCart(page, []);
    await page.goto('/cart.html');

    await expect(page.getByText('购物车是空的')).toBeVisible();
    await expect(page.getByRole('link', { name: '去逛逛' })).toBeVisible();
    await expect(page.getByRole('link', { name: '购物车 (0)' })).toBeVisible();
  });

  test('CART-02 [P0] 多行小计、合计与顶栏计数正确', async ({ loggedIn: page }) => {
    await seedCart(page, [
      { id: 'b001', qty: 2 }, // 89 × 2 = 178
      { id: 'b003', qty: 1 }, // 99 × 1 = 99
      { id: 'b004', qty: 1 }, // 139 × 1 = 139
    ]);
    await page.goto('/cart.html');

    // 各行小计（行内作用域，避开与单价同值的歧义）
    await expect(page.getByRole('listitem').filter({ hasText: '重构' })).toContainText('¥178');
    await expect(page.getByRole('listitem').filter({ hasText: '设计模式' })).toContainText('¥99');
    await expect(page.getByRole('listitem').filter({ hasText: '深入理解计算机系统' })).toContainText('¥139');
    // 合计与顶栏计数（2+1+1=4）
    await expect(page.getByText('合计：¥416')).toBeVisible();
    await expect(page.getByRole('link', { name: '购物车 (4)' })).toBeVisible();
  });

  test('CART-03 [P1] 点 + 后数量、行小计、合计、顶栏计数同步更新', async ({ loggedIn: page }) => {
    await seedCart(page, [{ id: 'b001', qty: 1 }]); // 89
    await page.goto('/cart.html');

    const row = page.getByRole('listitem').filter({ hasText: '重构' });
    await row.getByRole('button', { name: '增加' }).click();

    await expect(row.getByText('2', { exact: true })).toBeVisible(); // qty
    await expect(row).toContainText('¥178'); // 行小计 89×2
    await expect(page.getByText('合计：¥178')).toBeVisible();
    await expect(page.getByRole('link', { name: '购物车 (2)' })).toBeVisible();
  });

  test('CART-04 [P0] qty=1 时点 - 整行被移除，不留 0 行', async ({ loggedIn: page }) => {
    await seedCart(page, [
      { id: 'b005', qty: 1 }, // 活着
      { id: 'b001', qty: 1 }, // 重构（保留行，确认只移除目标行）
    ]);
    await page.goto('/cart.html');

    const row = page.getByRole('listitem').filter({ hasText: '活着' });
    await row.getByRole('button', { name: '减少' }).click();

    // 业务状态：该行从购物车消失，另一行仍在，计数从 2 降到 1
    await expect(page.getByText('活着')).toHaveCount(0);
    await expect(page.getByRole('listitem').filter({ hasText: '重构' })).toHaveCount(1);
    await expect(page.getByRole('link', { name: '购物车 (1)' })).toBeVisible();
  });

  test('CART-05 [P1] 点移除删除整行，合计与计数更新', async ({ loggedIn: page }) => {
    await seedCart(page, [
      { id: 'b001', qty: 1 }, // 89 重构
      { id: 'b005', qty: 1 }, // 35 活着
    ]);
    await page.goto('/cart.html');

    const row = page.getByRole('listitem').filter({ hasText: '重构' });
    await row.getByRole('button', { name: '移除' }).click();

    await expect(page.getByText('重构')).toHaveCount(0);
    await expect(page.getByRole('listitem').filter({ hasText: '活着' })).toHaveCount(1);
    await expect(page.getByText('合计：¥35')).toBeVisible(); // 只剩活着
    await expect(page.getByRole('link', { name: '购物车 (1)' })).toBeVisible();
  });
});
