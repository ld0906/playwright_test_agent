import { test, expect } from '../fixtures/auth';

/**
 * 模块二 · 书籍列表 + 模块三 · 书籍详情（不含缺陷类用例，缺陷见 risks.spec.ts）
 * 覆盖：DET-01(P0) + LIST-01/LIST-02/DET-03/DET-06(P1)。
 * 跳过 P2：LIST-03/04/05、DET-02/07。
 */
test.describe('模块二 · 书籍列表', () => {
  test('LIST-01 [P1] 默认展示全部 10 本书', async ({ loggedIn: page }) => {
    await page.goto('/books.html');
    const list = page.getByRole('list', { name: '书籍列表' });
    await expect(list.getByRole('listitem')).toHaveCount(10);
  });

  test('LIST-02 [P1] 分类筛选只显示对应分类的书', async ({ loggedIn: page }) => {
    await page.goto('/books.html');
    const list = page.getByRole('list', { name: '书籍列表' });

    await page.getByLabel('分类', { exact: true }).selectOption('engineering');
    await expect(list.getByRole('listitem')).toHaveCount(4);
    await expect(page.getByText('活着')).toHaveCount(0); // 小说类不应出现
    // await expect(page.locator('#book-list > li:nth-child(1) > a > h3')).toHaveCount(0); 


    await page.getByLabel('分类', { exact: true }).selectOption('fiction');
    await expect(list.getByRole('listitem')).toHaveCount(3);
    await expect(page.getByRole('heading', { name: '活着' })).toBeVisible();

    await page.getByLabel('分类', { exact: true }).selectOption('psychology');
    await expect(list.getByRole('listitem')).toHaveCount(3);
    await expect(page.getByRole('heading', { name: '影响力' })).toBeVisible();
  });
});

test.describe('模块三 · 书籍详情', () => {
  test('DET-01 [P0] 在售书加入购物车成功，顶栏计数 +1', async ({ loggedIn: page }) => {
    await page.goto('/book.html?id=b001');
    await expect(page.getByRole('link', { name: '购物车 (0)' })).toBeVisible();

    await page.getByRole('button', { name: '加入购物车' }).click();

    // 业务状态：加车反馈 + 顶栏计数从 0 变为 1
    await expect(page.getByText('已加入购物车')).toBeVisible();
    await expect(page.getByRole('link', { name: '购物车 (1)' })).toBeVisible();
  });

  test('DET-03 [P1] 已下架书显示下架徽章', async ({ loggedIn: page }) => {
    await page.goto('/book.html?id=b003');
    await expect(page.getByText('⚠️ 已下架')).toBeVisible();
  });

  test('DET-06 [P1] 重复加车数量累加为同一行 qty=2', async ({ loggedIn: page }) => {
    await page.goto('/book.html?id=b001');
    const addBtn = page.getByRole('button', { name: '加入购物车' });
    await addBtn.click();
    await addBtn.click();

    // 顶栏计数累加到 2
    await expect(page.getByRole('link', { name: '购物车 (2)' })).toBeVisible();

    // 购物车内是同一行 qty=2，而非两行
    await page.goto('/cart.html');
    const row = page.getByRole('listitem').filter({ hasText: '重构' });
    await expect(row).toHaveCount(1);
    await expect(row.getByText('2', { exact: true })).toBeVisible();
    await expect(row).toContainText('¥178'); // 89 × 2 行小计
  });
});
