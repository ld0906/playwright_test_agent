import { test, expect } from '../fixtures/auth';

test.describe('书籍列表', () => {
  test('TC-06 [P0] 默认显示全部 10 本书', async ({ loggedIn: page }) => {
    const cards = page.locator('.book-card');
    await expect(cards).toHaveCount(10);
  });

  test('TC-07 [P1] 按"工程"分类筛选只剩 4 本', async ({ loggedIn: page }) => {
    await page.getByLabel('分类').selectOption('engineering');
    const cards = page.locator('.book-card');
    await expect(cards).toHaveCount(4);
    await expect(page.getByText('重构：改善既有代码的设计')).toBeVisible();
  });

  test('TC-08 [P1] 已下架书在列表展示徽章', async ({ loggedIn: page }) => {
    const designPatterns = page.locator('.book-card', { hasText: '设计模式' });
    await expect(designPatterns.getByText('已下架')).toBeVisible();
  });
});
