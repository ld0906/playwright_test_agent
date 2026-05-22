#!/usr/bin/env node
// 对比当前测试结果和 baseline.json
// - test.fail() 标记的用例预期失败：状态符合 baseline 就 OK
// - 如果"预期失败"的用例突然通过 → 报警（bug 可能修了）
// - 如果"预期通过"的用例失败 → 报警（真红）

const fs = require('fs');

const [, , resultsPath, baselinePath] = process.argv;
if (!resultsPath || !baselinePath) {
  console.error('用法：node diff-baseline.js results.json baseline.json');
  process.exit(2);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

let regressions = [];
let unexpectedPasses = [];

function walk(suite, parentPath = '') {
  const here = parentPath ? `${parentPath} > ${suite.title}` : suite.title;
  for (const spec of suite.specs || []) {
    const id = `${here} > ${spec.title}`;
    const status = spec.tests?.[0]?.results?.[0]?.status || 'unknown';
    const expected = baseline[id] || 'passed';

    if (expected === 'failed' && status === 'passed') {
      unexpectedPasses.push(id);
    } else if (expected === 'passed' && status !== 'passed') {
      regressions.push({ id, status });
    }
  }
  for (const child of suite.suites || []) walk(child, here);
}

for (const s of results.suites || []) walk(s);

console.log(`\n📊 baseline diff report\n${'='.repeat(50)}`);
console.log(`✅ unexpected passes: ${unexpectedPasses.length}`);
unexpectedPasses.forEach(id => console.log(`   - ${id}`));
console.log(`❌ regressions: ${regressions.length}`);
regressions.forEach(r => console.log(`   - ${r.id} (${r.status})`));

if (regressions.length > 0 || unexpectedPasses.length > 0) {
  process.exit(1);
}
