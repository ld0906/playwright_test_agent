import { test, expect } from '../fixtures/auth';

test.describe('购物车', () => {
  test('TC-10 [P0] 详情页加车成功，顶栏计数 +1', async ({ loggedIn: page }) => {
    await page.goto('/book.html?id=b001');
    await expect(page.getByRole('heading', { name: '重构：改善既有代码的设计' })).toBeVisible();

    await page.getByRole('button', { name: '加入购物车' }).click();
    await expect(page.getByRole('status')).toHaveText('已加入购物车');
    await expect(page.locator('#cart-count')).toHaveText('1');
  });

  test('TC-11 [P1] 同一本书重复加入数量累加', async ({ loggedIn: page }) => {
    await page.goto('/book.html?id=b001');
    const addBtn = page.getByRole('button', { name: '加入购物车' });
    await addBtn.click();
    await addBtn.click();
    await addBtn.click();

    await expect(page.locator('#cart-count')).toHaveText('3');

    await page.goto('/cart.html');
    const rows = page.locator('.cart-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first().locator('.qty-num')).toHaveText('3');
  });

  test('TC-13 [P0] 购物车数量增减实时同步合计', async ({ loggedIn: page }) => {
    await page.goto('/book.html?id=b001');
    await page.getByRole('button', { name: '加入购物车' }).click();
    await page.goto('/cart.html');

    const row = page.locator('.cart-row').first();
    await row.getByRole('button', { name: '增加' }).click();
    await row.getByRole('button', { name: '增加' }).click();

    await expect(row.locator('.qty-num')).toHaveText('3');
    await expect(page.locator('#grand-total')).toHaveText(`¥${89 * 3}`);
  });

  test('TC-14 [P0] 数量减到 0 自动从购物车移除', async ({ loggedIn: page }) => {
    await page.goto('/book.html?id=b001');
    await page.getByRole('button', { name: '加入购物车' }).click();
    await page.goto('/cart.html');

    await page.locator('.cart-row').first().getByRole('button', { name: '减少' }).click();
    await expect(page.locator('.cart-row')).toHaveCount(0);
    await expect(page.locator('#cart-count')).toHaveText('0');
  });
});
