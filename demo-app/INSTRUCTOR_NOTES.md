# 讲师备忘：mini-bookstore 内部信息

> 这份文件不要分发给学员，只供你（讲师）参考。

---

## 隐藏 bug 清单

### Bug #1：已下架书可以加入购物车（核心 bug）

- **位置**：`public/book.html` 中 `add-to-cart` 按钮的 click 处理
- **现象**：详情页对 `discontinued: true` 的书显示 "⚠️ 已下架" 红色徽章，但点"加入购物车"按钮仍然成功加进购物车
- **预期**：应当禁用按钮或弹出提示拒绝
- **用途**：第 3 集 Planner 探索时，期望 AI 能在测试计划里把它列为风险测试点；如果 AI 没发现，你可以引导

涉及的两本下架书：
- b003 设计模式（stock=0, discontinued=true）
- b007 三体绝版纪念版（stock=0, discontinued=true）

### Bug #2：购物车减到 0 时自动移除（非 bug，是设计）

- 这不是 bug，是有意行为。如果 Planner 误报，可以借机讲"AI 不知道业务规则"
- 第 3 集课程稿里会用这个点

## 第 6 集 healer 准备的 broken commit

在第 6 集脚本里会让你执行两个 git commit 操作来"故意打破" UI：

### Broken Commit A：改按钮文案

```bash
git checkout -b broken-a
# 把 books.html / book.html 里的"加入购物车"改成"立即购买"
sed -i '' 's/加入购物车/立即购买/g' public/book.html
git commit -am "feat: rename add to cart button"
```

### Broken Commit B：改 DOM 结构

```bash
git checkout -b broken-b
# 把 login.html 的 input[name="username"] 改成 input[name="userId"]
sed -i '' 's/name="username"/name="userId"/' public/login.html
git commit -am "feat: rename username field to userId"
```

第 6 集会演示 Healer 如何处理这两种情况，对比"修对了" vs "修绕了"。

## 内置测试账号扩展（如需）

当前只有 alice / password。如果想给学员练多账号场景，可以在 login.html 的校验逻辑里加：
- bob / password（已锁定状态，留作扩展）
- admin / admin（错误密码，留作错误提示场景）
