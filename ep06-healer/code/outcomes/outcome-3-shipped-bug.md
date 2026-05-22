# Healer 结局 3：🔴 把 bug 给"修没了"——bug 上线

> 场景：应用了 Broken B（input name 从 username → userId）
> 失败用例：auth.spec.ts TC-01 正确账号登录
> Healer 行为：机械修复 locator，但根本没意识到这次 rename 可能是个 bug

---

## 背景：这次"refactor"的真相

提交信息写的是：

> `refactor(auth): rename field 'username' to 'userId'`

**真实情况**：

- 前端字段名改了
- 但后端 API 并没有相应改动
- 这次 rename 是开发同学**自以为是"统一命名"**，实际上是引入了一个会让生产登录挂掉的 bug
- 在 demo-app 这种纯前端 app 里，因为校验逻辑也在前端，看起来还能登（前端自己跟自己对得上）
- 但在真实项目里，提交 form 时 POST 体里字段名变了，后端报 422

## Healer 怎么"成功"修了的

失败前的 spec：

```ts
await page.locator('input[name="username"]').fill('alice');
```

Healer 看到 DOM 里 input 现在是 `name="userId"`，机械替换：

```ts
await page.locator('input[name="userId"]').fill('alice');
```

测试绿了。Healer 输出：

> 修复完成。input 字段已重命名为 userId，已同步更新 locator。

## 为什么这是"灾难"

- 🔴 **Healer 没意识到 rename 可能是有歧义的变更**
- 🔴 测试绿了，CI 通过，PR 合并，bug 上线
- 🔴 直到生产用户报"登不上"才被发现
- 🔴 这种"修对了 locator 但掩盖了真 bug"是 Healer 最危险的失败模式

## 这本来应该怎么处理

✅ 正确的 Healer 行为：

> 检测到 `input[name="username"]` → `input[name="userId"]` 的变更。
> 这是一次 **可能影响业务契约** 的改名（form field name 通常对应后端 API 字段）。
> 我**不会**自动修复，请人工确认：
>
> 1. 后端 API 字段是否同步改名？
> 2. 这是一次 schema 变更还是 typo？
>
> 在确认前，相关用例保持失败状态。

## 守门规则

> **改 form input 的 name 属性、改 API 路径、改字段含义——Healer 必须停手，等人来。**

可以在 Healer prompt 里加白名单：

```
你只能自动修复以下类型的失败：
1. 按钮/链接文案改名
2. 元素位置变化（locator 失效但语义相同）
3. 多语言切换导致的文案变化

以下情况必须停手并报告，不允许自动修复：
1. form input 的 name 属性变化
2. 涉及 API URL / 字段名的变化
3. 多个用例同时失败（可能是大改动）
4. 你需要修改 assertion 才能让用例通过
```

## 你（讲师）要让学员看到

让 Healer 跑 auth.spec.ts 的失败用例，**不加约束**，看它怎么直接帮你"修好"。
然后让学员去 demo-app 的 login.html 里**人工把 name 改回 username**——
模拟 "后端发现没改成功"的场景。

你会发现 spec 又挂了。这一刻学员就理解了：**Healer 的"修对"和"真对"不是一回事**。
