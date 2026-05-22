import { test, expect } from '@playwright/test';

test.describe('登录模块', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login.html');
    await page.evaluate(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
    });
    await page.goto('/login.html');
  });

  test('TC-01 [P0] 正确账号登录成功跳列表页', async ({ page }) => {
    await page.getByLabel('用户名').fill('alice');
    await page.getByLabel('密码').fill('password');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL(/\/books\.html$/);
    await expect(page.getByText('你好，alice')).toBeVisible();
  });

  test('TC-02 [P0] 错误密码停留登录页并提示', async ({ page }) => {
    await page.getByLabel('用户名').fill('alice');
    await page.getByLabel('密码').fill('wrong');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL(/\/login\.html$/);
    await expect(page.getByRole('alert')).toHaveText('用户名或密码错误');
  });

  test('TC-03 [P0] 未登录访问列表页自动跳回登录', async ({ page }) => {
    await page.goto('/books.html');
    await expect(page).toHaveURL(/\/login\.html$/);
  });
});
