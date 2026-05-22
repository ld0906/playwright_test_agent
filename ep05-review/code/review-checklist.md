# AI 生成 Playwright 脚本 · 三关 review 清单

> 18 项检查，每一项都对应一种典型的 AI 偷工减料。
> 用法：把这份清单贴进你 PR 模板，或者交给 AI 让它自审。

---

## 第 1 关：locator 稳定性（6 项）

- [ ] 没有 CSS 长路径：禁止 `nth-child` / `>` / `:nth-of-type` / `div > div > button`
- [ ] 没有自动生成的类名：禁止 `_abc123` / `css-1xy` / `MuiButton-root-345`
- [ ] 优先用 `getByRole / getByLabel / getByText / getByPlaceholder`
- [ ] 没有 `page.locator('xxx').first()` 后跟一串隐式假设（如果非要用 first，加注释说明为什么不会有多个）
- [ ] 没有 XPath，除非业务页面真的没有可用的语义
- [ ] 同一组元素的定位策略一致，不混用（一个 spec 里别 5 种 locator 都来一遍）

## 第 2 关：等待方式（5 项）

- [ ] **没有 `waitForTimeout`**（出现一次就 reject PR）
- [ ] 没有自己写的 `for...setTimeout` 轮询
- [ ] 用 web-first assertion 隐式等待（`await expect(...).toBeVisible()` 而不是 `if (await element.isVisible())`）
- [ ] 跳转后等待用 `await expect(page).toHaveURL(...)`，不是 `waitForLoadState`
- [ ] 网络等待用 `waitForResponse` 或 `waitForRequest`，给明确的 URL 匹配，不要 `waitForLoadState('networkidle')`

## 第 3 关：断言深度（7 项）

- [ ] 用例名说"成功"，断言就要断成功的业务状态，不能只断"看到提示"
- [ ] 用例名说"失败"，断言要正反都断：错误出现 ∧ 成功页未出现
- [ ] 不允许 `expect(...).toBeTruthy()` / `toBeDefined()` 这种万能断言
- [ ] 不允许 `expect(page).toHaveTitle()` 作为唯一断言
- [ ] 涉及金额、数量、计数：必须断具体数值，不能只断元素出现
- [ ] 涉及状态变更：必须断状态前后的对比（如购物车计数 0→1）
- [ ] 不允许 `or()` 断言用在用例的主断言上（or 让用例永远绿）

---

## 三关之外：4 项加分项

- [ ] 公共动作抽 fixture（登录、构造购物车、清空数据）
- [ ] 用例独立可重复跑（不依赖前一个用例的状态）
- [ ] `test.describe.beforeEach` 做数据准备，不放业务断言
- [ ] 已知 bug 用 `test.fail()` 标记并附 issue 号，进回归基线

---

## 怎么用

### 方式 1：人工 review
- 改 PR 的时候打印这份清单
- 每条对照过一遍再 approve

### 方式 2：让 AI 自审
把整份清单贴进 Claude Code，加一句：

> 对照下面 18 项清单，逐项检查 specs/ 目录下所有 .spec.ts 文件，列出违反项，给出修复建议。

### 方式 3：进 CI
用 ESLint 规则 / 自定义脚本扫描其中可机器化的几项：
- `waitForTimeout` 出现 → fail
- `toBeTruthy/toBeDefined` 出现 → fail
- 文件超过 N 行且没用 fixture → warn
