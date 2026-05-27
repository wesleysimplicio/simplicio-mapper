#!/usr/bin/env node
'use strict';

// Runs the Node.js built-in test runner with V8 coverage and converts the
// "all files" summary row into coverage/coverage-summary.json (Istanbul
// json-summary shape) so the DoD gate can read total.lines.pct.
//
// Parses the textual coverage table instead of the lcov reporter so it works
// across the Node 20 and 22 CI matrix (the lcov reporter is not available on
// every supported version). Dependency-free.

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const COVERAGE_DIR = path.resolve(process.cwd(), 'coverage');
const SUMMARY_PATH = path.join(COVERAGE_DIR, 'coverage-summary.json');

fs.mkdirSync(COVERAGE_DIR, { recursive: true });

const result = spawnSync(
  process.execPath,
  ['--test', '--experimental-test-coverage'],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
);

if (result.error) {
  console.error(`coverage run failed to start: ${result.error.message}`);
  process.exit(1);
}

const stdout = result.stdout || '';
const stderr = result.stderr || '';
process.stdout.write(stdout);
if (stderr) process.stderr.write(stderr);

// Matches the summary row, tolerating the "# " (tap) or "ℹ " (spec) prefix:
//   all files | 91.32 | 69.97 | 88.39 |
const match = stdout.match(/all files\s*\|\s*([0-9.]+)\s*\|\s*([0-9.]+)\s*\|\s*([0-9.]+)/);

if (!match) {
  if (result.status !== 0) process.exit(result.status);
  console.error('::error::could not parse coverage summary row from test output');
  process.exit(1);
}

const linesPct = Number(match[1]);
const branchesPct = Number(match[2]);
const functionsPct = Number(match[3]);
const metric = (pct) => ({ total: 0, covered: 0, skipped: 0, pct });

const summary = {
  total: {
    lines: metric(linesPct),
    statements: metric(linesPct),
    functions: metric(functionsPct),
    branches: metric(branchesPct),
  },
};

fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2) + '\n');
console.log(`coverage summary written to ${path.relative(process.cwd(), SUMMARY_PATH)} `
  + `(lines ${linesPct}%, functions ${functionsPct}%, branches ${branchesPct}%)`);

process.exit(result.status === null ? 1 : result.status);
