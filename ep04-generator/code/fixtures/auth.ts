import { test as base, expect, Page } from '@playwright/test';

/**
 * 共享登录辅助：跳过登录页面 UI 走 localStorage 直接置位。
 * UI 登录路径在 auth.spec.ts 里专门测，其他业务用例用这个 fixture 提速。
 */
export async function loginAs(page: Page, username = 'alice') {
  await page.goto('/login.html');
  await page.evaluate((u) => localStorage.setItem('user', u), username);
}

export const test = base.extend<{ loggedIn: Page }>({
  loggedIn: async ({ page }, use) => {
    await loginAs(page);
    await page.goto('/books.html');
    await expect(page.getByRole('list', { name: '书籍列表' })).toBeVisible();
    await use(page);
  },
});

export { expect };
