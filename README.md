# Playwright Test Agents 实战：让 AI 自己探索 UI

> 8 集短视频课，从 0 到 1 跑通 Playwright 官方 Test Agents（Planner / Generator / Healer），
> 并把它接入团队 CI。

---

## 课程定位

- **不是**：Playwright 入门、AI 测试工具盘点、ChatGPT 写脚本
- **是**：Playwright 官方推出的 Test Agents 能力实战，用一个贯穿案例从探索 → 生成 → 自愈 → CI 完整走一遍

## 适合人群

- 已经写过 Playwright/Cypress 至少一个项目的测试工程师
- 想试 AI 自动化但被"AI 生成脚本能跑不能维护"卡住的人
- 测试开发，希望把 AI 生成能力接入团队 CI 流程

## 你将得到

- 8 集短视频（每集 8-10 分钟）
- 一个完整可跑的迷你书店 demo 应用（学员动手对象）
- 三个测试代理的 seed 文档、配置文件、产出参考
- 一份能进 CI 的 GitHub Actions 工作流

## 8 集路线图

| 集 | 标题 | 关键产物 |
|---|---|---|
| 1 | Playwright Test Agents 是什么：和 codegen / 手写脚本的边界 | 概念对比 + 课程地图 |
| 2 | 环境搭建：Playwright + MCP + Claude Code 一次跑通 | 最小可运行工程 |
| 3 | 案例 App 介绍 + Planner Agent：让 AI 探索应用 | seed.md + AI 产出测试计划 |
| 4 | Generator Agent：从计划到可运行 spec | 可跑的 specs/ |
| 5 | 审查 AI 生成的脚本：locator / 等待 / 断言三关 | review 清单 + 改写后 spec |
| 6 | Healer Agent：UI 改了，让 AI 自动修 | broken commit + healer 跑通 |
| 7 | 三个 agent 串起来：完整回归工作流 | 一键脚本 |
| 8 | 接入 CI + 什么时候不该用 Test Agents | GitHub Actions yml + 决策清单 |

## 贯穿案例：迷你书店 demo

- 单页 Next.js 应用，`npm install && npm run dev` 一行起
- 覆盖登录 / 列表 / 详情 / 购物车 / 结账 5 条主线
- 内置一个"故意藏的 bug"（已下架书可以加车），用来演示 AI 找 bug
- 第 6 集准备 broken commit，专门用于 healer 演示

## 目录结构

```
playwright-test-agents-course/
├── README.md
├── demo-app/                     学员动手对象（迷你书店）
├── ep01-what-are-test-agents/    每集一个文件夹
│   ├── slides.md                 PPT 大纲
│   ├── script.md                 录播稿
│   └── handout.md                学员行动卡
├── ep02-setup/
│   ├── slides.md / script.md / handout.md
│   └── code/                     可跑配置 / 脚本
...
```

## 销售页文案

**标题**：Playwright Test Agents 实战：让 AI 自己探索 UI

**副标题**：8 集，把 Playwright 官方 AI 测试代理从概念变成你团队 CI 里能跑的回归资产。

**课程介绍**：

Playwright 在 2025 年推出了 Test Agents——三个互相配合的 AI 代理，分别负责探索（Planner）、生成（Generator）、自愈（Healer）。

但官方文档只告诉你"它能做什么"，没告诉你：

- 怎么写好 seed 让 Planner 不瞎逛？
- Generator 生成的脚本怎么 review 才不会进 CI 后就挂？
- Healer 自愈出来的脚本是"修对了"还是"绕过去"了？
- 三个 agent 怎么串成一条工作流？
- 什么场景根本不该用 Test Agents？

这门课用一个完整可跑的迷你书店应用，带你从环境搭建走到 CI 接入。每集都有可动手的产物，不堆概念。

**学完你能**：

- 在自己项目里跑通 Playwright Test Agents
- 写出让 AI 不瞎逛的 seed 文档
- 用 review 清单审查 AI 生成的脚本
- 设计能自愈但不会"修错"的回归流程
- 把整套流程接入 GitHub Actions

**一句话总结**：

让 AI 帮你写脚本只是入门，让 AI 写出来的脚本能进 CI 才是工程。
# playwright_test_agent
