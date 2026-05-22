#!/usr/bin/env node
// 批量修补 ep02-08 的 index.html: title + DECK_MANIFEST
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

const EPISODES = [
  {
    dir: 'ep02-setup',
    title: 'EP 02 · 环境搭建 Playwright + MCP + Claude Code',
    slides: [
      ['01-cover.html',        'Cover'],
      ['02-three-layers.html', '三层架构'],
      ['03-step1.html',        'Step 1 · 起 demo-app'],
      ['04-step2.html',        'Step 2 · 装 Playwright'],
      ['05-step3.html',        'Step 3 · 配 MCP'],
      ['06-step4.html',        'Step 4 · Claude Code 验证'],
      ['07-troubleshoot.html', '踩坑速查'],
      ['08-action.html',       '本集行动'],
    ],
  },
  {
    dir: 'ep03-planner',
    title: 'EP 03 · Planner Agent · 让 AI 自己探索应用',
    slides: [
      ['01-cover.html',     'Cover'],
      ['02-how-it-works.html', 'Planner 怎么工作'],
      ['03-seed-rules.html',   '写 seed 的 5 个原则'],
      ['04-seed-walkthrough.html', 'mini-bookstore seed'],
      ['05-prompt.html',       '唤起 prompt'],
      ['06-demo.html',         '演示 · Planner 跑起来'],
      ['07-bug-discovery.html','发现隐藏 bug'],
      ['08-action.html',       '本集行动 + 反向作业'],
    ],
  },
  {
    dir: 'ep04-generator',
    title: 'EP 04 · Generator Agent · 从计划到可运行 spec',
    slides: [
      ['01-cover.html',         'Cover'],
      ['02-how-it-works.html',  'Generator 怎么工作'],
      ['03-constraints.html',   '4 条硬约束'],
      ['04-scaffold.html',      '项目骨架'],
      ['05-prompt.html',        '唤起 prompt'],
      ['06-demo.html',          '演示'],
      ['07-three-failures.html','3 种失败要分清'],
      ['08-action.html',        '本集行动'],
    ],
  },
  {
    dir: 'ep05-review',
    title: 'EP 05 · 审查 AI 生成的脚本 · 三关心法',
    slides: [
      ['01-cover.html',     'Cover'],
      ['02-why-green-is-not-safe.html', '为什么绿了也不能信'],
      ['03-gate1-locator.html', '第 1 关 · locator'],
      ['04-gate2-wait.html',    '第 2 关 · 等待'],
      ['05-gate3-assert.html',  '第 3 关 · 断言'],
      ['06-bad-vs-good.html',   'bad → good 改写'],
      ['07-ai-self-review.html','让 AI 自审'],
      ['08-action.html',        '本集行动 + 反向作业'],
    ],
  },
  {
    dir: 'ep06-healer',
    title: 'EP 06 · Healer Agent · 修对 ≠ 真对',
    slides: [
      ['01-cover.html',           'Cover'],
      ['02-how-it-works.html',    'Healer 怎么工作'],
      ['03-two-breaks.html',      '今天的两个破坏'],
      ['04-outcome-good.html',    'Broken A · 理想结局'],
      ['05-outcome-worked-around.html', '同场景 · 修绕'],
      ['06-outcome-disaster.html','Broken B · 灾难现场'],
      ['07-guard-prompt.html',    '守门 prompt'],
      ['08-action.html',          '本集行动'],
    ],
  },
  {
    dir: 'ep07-workflow',
    title: 'EP 07 · 三个 agent 串成完整工作流',
    slides: [
      ['01-cover.html',         'Cover'],
      ['02-no-full-auto.html',  '为什么不一键全跑'],
      ['03-decision-tree.html', '决策树'],
      ['04-five-steps.html',    '完整 5 步流程'],
      ['05-scenario-a.html',    '场景 A · 新需求'],
      ['06-scenario-b.html',    '场景 B · UI 改版'],
      ['07-script-it.html',     '把工作流脚本化'],
      ['08-action.html',        '本集行动'],
    ],
  },
  {
    dir: 'ep08-ci-and-boundaries',
    title: 'EP 08 · 接入 CI + 什么时候不该用 · 结业课',
    slides: [
      ['01-cover.html',         'Cover'],
      ['02-three-principles.html', 'CI 接入 3 原则'],
      ['03-pr-workflow.html',   'PR Workflow'],
      ['04-nightly.html',       'Nightly + 基线'],
      ['05-no-agent-on-pr.html','为什么 PR 不跑 agent'],
      ['06-divider.html',       '会用 vs 何时不用'],
      ['07-when-not-to-use.html','4 种不该用场景'],
      ['08-roadmap.html',       '30 天落地路线图'],
      ['09-graduation.html',    '结业 · 三句话送你'],
    ],
  },
];

for (const ep of EPISODES) {
  const indexPath = path.join(ROOT, ep.dir, 'deck', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // 替换 title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${ep.title}</title>`,
  );

  // 替换 DECK_MANIFEST
  const manifest = ep.slides
    .map(([f, l]) => `    { file: "slides/${f}", label: ${JSON.stringify(l)} },`)
    .join('\n');
  html = html.replace(
    /window\.DECK_MANIFEST = \[[\s\S]*?\];/,
    `window.DECK_MANIFEST = [\n${manifest}\n  ];`,
  );

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`✓ ${ep.dir}/deck/index.html · ${ep.slides.length} slides`);
}
