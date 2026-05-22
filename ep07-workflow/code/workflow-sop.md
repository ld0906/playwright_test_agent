# Playwright Test Agents 团队工作流 SOP

> 把三个 agent 串成"什么时候用什么"的标准流程。
> 这份文档进 git，进 onboarding 材料，进 PR 模板。

---

## 决策树：变更来了，先问三个问题

```
变更类型？
├── 新增/修改业务功能          → Planner + Generator
├── 仅 UI 调整（文案/位置）    → Healer
└── 既有业务变又有 UI 变       → Planner 增量 + Healer
```

**问题 1：是不是业务规则变了？**
- 是 → 必须更新 seed.md，再跑 Planner
- 否 → 跳过 Planner

**问题 2：有没有新增页面或新功能？**
- 是 → 跑 Generator 补 spec
- 否 → 跳过 Generator

**问题 3：现有 spec 是不是因为 UI 微调挂了？**
- 是 → 用守门 prompt 跑 Healer
- 否 → 人工修

---

## 完整工作流（5 步）

```
┌─────────────────────────────────────────────────────────┐
│                    需求/变更进入                          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ 1. 更新 seed.md             │   ← 测试负责人 / 测开
        │    （只写业务规则变化）        │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ 2. Planner 增量探索          │   ← AI（review by 测试）
        │    输出 test-plan-diff       │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ 3. 人工 review test-plan     │   ← 测试工程师
        │    调整优先级、补漏点          │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ 4. Generator 生成新 spec     │   ← AI（约束 prompt）
        │    跑 review-checklist 自审   │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ 5. 跑测试                   │   ← CI
        │    红的进 Healer 守门 prompt  │
        └─────────────────────────────┘
```

---

## 角色分工

| 角色 | 负责 | 不负责 |
|---|---|---|
| **产品 / 业务方** | 提供需求描述、业务规则边界 | 不写测试用例 |
| **测试负责人** | 维护 seed.md、定优先级、最终 review | 不亲自跑 agent |
| **测试工程师** | 跑 Planner / Generator、review AI 产出、跑 Healer | 不"放手让 AI 全自动" |
| **AI agents** | 探索、生成、修复 | 不做业务判断、不改断言、不上线决策 |

---

## 三个 agent 的"边界宪法"

### Planner

- ✅ 探索应用、产出 Markdown 测试计划
- ✅ 标注优先级、点出疑似 bug
- ❌ 不写代码、不改 seed、不改 spec

### Generator

- ✅ 把 test-plan 翻译成 Playwright spec
- ✅ 用项目 fixtures 和 review-checklist 约束
- ❌ 不改 seed、不改 test-plan、不改 playwright.config
- ❌ 不"自己决定不写哪些用例"——P0 必须全生成

### Healer

- ✅ 修复 locator 失效（文案/位置/语义不变）
- ❌ 不改 assertion
- ❌ 不引入 waitForTimeout
- ❌ 不修 form input name / API 字段变化（必须 NEEDS-HUMAN）
- ❌ 不在多个用例同时失败时硬修

---

## 触发节奏

| 事件 | 触发哪个流程 |
|---|---|
| 周一晨会有新需求 | 走 5 步全流程 |
| 开发同学合了 UI PR | CI 跑测试，红的进 Healer 守门 prompt |
| 季度回归 | 跑全部 spec，关注 RISK-* 用例的 test.fail 状态变化 |
| seed.md 大改 | 完整重跑 Planner，对比新旧 test-plan |

---

## 一句话总结

> Planner 是初级测试，Generator 是初级测试开发，Healer 是初级运维。
> 你（测试工程师）是他们的 tech lead。
