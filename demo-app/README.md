# mini-bookstore：课程贯穿案例

> 一个最小可控的迷你书店应用，给《Playwright Test Agents 实战》全课使用。

---

## 一键启动

```bash
cd demo-app
npm run dev
```

浏览器打开 http://localhost:5173

无需 `npm install`，`npm run dev` 会自动通过 npx 拉起静态服务器。

## 测试账号

| 用户名 | 密码 |
|---|---|
| alice | password |

## 5 条主线功能

1. **登录**（/login.html）：账号校验、错误提示
2. **书籍列表**（/books.html）：分类筛选（工程 / 小说 / 心理）
3. **书籍详情**（/book.html?id=xxx）：查看简介、库存、加入购物车
4. **购物车**（/cart.html）：数量增减、移除、合计
5. **结账**（/checkout.html）：表单校验、下单成功页

## 技术栈

- 纯静态 HTML + 原生 JavaScript
- 状态全部存 localStorage（无后端、无数据库）
- 数据源：`public/data/books.json`

之所以选这个最简栈，是为了让学员把注意力放在测试代理本身，而不是被框架细节绊住。

## 目录结构

```
demo-app/
├── package.json              一键启动入口
├── README.md                 本文件
├── INSTRUCTOR_NOTES.md       讲师备忘（包含隐藏 bug 位置）
└── public/
    ├── serve.json            ⚠ serve 配置：禁用 cleanUrls（保留 .html 后缀和 query string）
    ├── index.html            根路径，根据登录态跳转
    ├── login.html            登录
    ├── books.html            列表 + 分类筛选
    ├── book.html             详情
    ├── cart.html             购物车
    ├── checkout.html         结账
    ├── styles.css            共享样式
    ├── app.js                共享 JS（登录态 / 购物车 / 渲染辅助）
    └── data/books.json       10 本书数据
```

## 故障排查

- 端口 5173 被占用：改 `package.json` 中的 `-l 5173` 为其他端口
- `npx` 第一次会下载 serve，速度慢请耐心等
- 看到登录页空白：清一下浏览器的 localStorage
- **点详情页都是"书籍不存在" / 加车不工作**：检查 `public/serve.json` 是否存在且包含 `"cleanUrls": false` —— 默认 serve 会把 `/book.html?id=b001` 重定向到 `/book` 并吞掉 query string，这份配置阻止它
- **打开根路径 `http://localhost:5173/` 显示 404**：`serve.json` 必须包含 `rewrites: [{ source: "/", destination: "/index.html" }]`。`directoryListing: false` 关掉了根路径自动找 index.html 的能力，rewrites 把它显式映射回来
