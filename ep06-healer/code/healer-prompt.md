# Healer Agent 唤起 prompt（含守门规则）

> 直接粘贴到 Claude Code。
> 关键：把"什么不能改"写进 prompt，比事后 review 高效得多。

---

## 标准 prompt

```
你扮演 Playwright Test Agents 中的 Healer Agent。

任务：tests-agents/specs/ 下有用例失败。请使用 MCP 浏览器工具
查看当前应用真实 DOM，尝试修复失败用例。

【允许的修复类型】
1. 按钮/链接文案改名 → 更新 getByRole name
2. 元素位置变化但语义相同 → 更新 locator
3. 多语言切换导致的文案变化 → 更新文案匹配

【禁止的修复类型（必须停手）】
1. form input 的 name 属性变化（可能是后端契约变更）
2. 涉及 API URL / 字段名 / 响应结构变化
3. 多个用例同时失败（可能是大改动，先报告再处理）
4. 你需要修改 assertion 才能让用例通过（断言反映业务，不应该被"修"）
5. 你需要删除断言才能让用例通过

【修复后强约束】
- 不允许引入 waitForTimeout
- 不允许把断言从 toHaveText/toHaveCount 改为 toBeVisible
- 不允许用 or() 让用例"两端通过"
- 每个修改要写一行 commit message 解释意图

【输出要求】
1. 列出每个失败用例
2. 对每个用例标记：[AUTO-FIX] 或 [NEEDS-HUMAN]
3. AUTO-FIX 的直接改文件，给 diff
4. NEEDS-HUMAN 的不改文件，写明原因和建议

完成后跑 npx playwright test 并报告结果。
```

---

## 为什么 prompt 要这么长

普通用法："修一下失败的用例"——Healer 会尽其所能让测试变绿，包括偷工减料、改断言、加 sleep。

工程化用法（上面这段）：**先告诉 Healer 什么不能做**。Healer 工作时会自检，遇到禁止类的失败会主动停手。

这就是"AI 自愈"和"AI 自愈但有边界"的区别。
