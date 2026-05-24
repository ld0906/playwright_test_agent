import { test, expect, seedCart } from '../fixtures/auth';

/**
 * 模块一 · 登录
 * 覆盖：LOGIN-01/02/06(P0) + LOGIN-03/04/07(P1)。LOGIN-05(P2) 跳过。
 *
 * 越界与拒登类用例使用全新（未登录）context 的 page，不触发 loggedIn 夹具。
 */
test.describe('模块一 · 登录', () => {
  test('LOGIN-01 [P0] 正确账号登录成功，跳转列表页并显示欢迎语', async ({ page }) => {
    await page.goto('/login.html');
    await page.getByLabel('用户名').fill('alice');
    // await page.locator('[name="username"]').fill('alice');  
    await page.getByLabel('密码').fill('password');
    await page.getByRole('button', { name: '登录' }).click();

    // 业务状态：进入列表页 + 顶栏识别出当前用户
    await expect(page).toHaveURL(/\/books\.html$/);
    await expect(page.getByText('你好，alice')).toBeVisible();
  });

  test('LOGIN-02 [P0] 错误密码被拒，停留登录页且提示错误', async ({ page }) => {
    await page.goto('/login.html');
    await page.getByLabel('用户名').fill('alice');
    await page.getByLabel('密码').fill('wrongpass');
    await page.getByRole('button', { name: '登录' }).click();

    await expect(page.getByRole('alert')).toHaveText('用户名或密码错误');
    await expect(page).toHaveURL(/\/login\.html$/);
    // 未写入登录态
    expect(await page.evaluate(() => localStorage.getItem('user'))).toBeNull();
  });

  test('LOGIN-03 [P1] 错误用户名被拒', async ({ page }) => {
    await page.goto('/login.html');
    await page.getByLabel('用户名').fill('bob');
    await page.getByLabel('密码').fill('password');
    await page.getByRole('button', { name: '登录' }).click();

    await expect(page.getByRole('alert')).toHaveText('用户名或密码错误');
    await expect(page).toHaveURL(/\/login\.html$/);
  });

  test('LOGIN-04 [P1] 用户名密码均为空，不登录、不跳转', async ({ page }) => {
    await page.goto('/login.html');
    // 两框留空直接提交：required 原生校验拦截，不会写入登录态
    await page.getByRole('button', { name: '登录' }).click();

    await expect(page).toHaveURL(/\/login\.html$/);
    expect(await page.evaluate(() => localStorage.getItem('user'))).toBeNull();
  });

  test('LOGIN-06 [P0] 未登录访问业务页一律跳回登录页', async ({ page }) => {
    for (const path of ['/books.html', '/book.html?id=b001', '/cart.html', '/checkout.html']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login\.html$/);
      await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
    }
  });

  test('LOGIN-07 [P1] 退出登录清空登录态与购物车', async ({ loggedIn: page }) => {
    await seedCart(page, [{ id: 'b001', qty: 2 }]);
    await page.goto('/books.html');
    await expect(page.getByRole('link', { name: '购物车 (2)' })).toBeVisible();

    await page.getByRole('button', { name: '退出' }).click();

    await expect(page).toHaveURL(/\/login\.html$/);
    // 业务状态：登录态与购物车均被清空
    expect(await page.evaluate(() => localStorage.getItem('user'))).toBeNull();
    expect(await page.evaluate(() => localStorage.getItem('cart'))).toBeNull();
  });
});
