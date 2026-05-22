import { test as base, expect, type Page } from '@playwright/test';

/**
 * 共享测试夹具。
 *
 * 被测应用（mini-bookstore）的登录态完全由 `localStorage.user` 决定，
 * 购物车由 `localStorage.cart` 决定，没有后端。因此复用登录态最稳的方式
 * 是直接写 localStorage —— 既快又不受登录页 UI 变化影响。
 */

export type CartItem = { id: string; qty: number };

type Fixtures = {
  /** 已登录（user=alice）并停在书籍列表页的 page。 */
  loggedIn: Page;
};

export const test = base.extend<Fixtures>({
  loggedIn: async ({ page }, use) => {
    // 先落到同源页面才能写 localStorage
    await page.goto('/login.html');
    await page.evaluate(() => localStorage.setItem('user', 'alice'));
    await page.goto('/books.html');
    // 等到业务状态就绪：顶栏出现欢迎语，确认登录态已被应用消费
    await expect(page.getByText('你好，alice')).toBeVisible();
    await use(page);
  },
});

/**
 * 预置购物车。必须在已处于被测站点同源（已 goto 过任意页面）后调用。
 * 调用后需重新 goto 目标页让页面用新购物车重新渲染。
 */
export async function seedCart(page: Page, items: CartItem[]): Promise<void> {
  await page.evaluate(
    (cart) => localStorage.setItem('cart', JSON.stringify(cart)),
    items,
  );
}

export { expect };
