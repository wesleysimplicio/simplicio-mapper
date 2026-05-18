/*
 * End-to-end coverage of the npx install flow.
 *
 * Playwright is used here as a test harness (parallelism, reporter, evidence attach),
 * not for browser navigation. Each test spawns `node bin/cli.js` against a fresh
 * temp directory and asserts the on-disk side effects. stdout/stderr and the
 * resulting `.starter-meta.json` are attached to the test report as evidence
 * to satisfy the DoD gate that demands Playwright artifacts.
 */

import { spawnSync, SpawnSyncReturns } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { expect, test, type TestInfo } from '@playwright/test';

const CLI = path.resolve(__dirname, '..', '..', 'bin', 'cli.js');
const NODE = process.execPath;

function mkTmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'lpm-e2e-'));
}

function rmTmp(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

function writeFile(dir: string, rel: string, content: string): void {
  const full = path.join(dir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

function runCli(args: string[], cwd: string): SpawnSyncReturns<string> {
  return spawnSync(NODE, [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 30_000,
  });
}

async function attachEvidence(testInfo: TestInfo, res: SpawnSyncReturns<string>, dir: string) {
  await testInfo.attach('stdout.txt', { body: res.stdout ?? '', contentType: 'text/plain' });
  await testInfo.attach('stderr.txt', { body: res.stderr ?? '', contentType: 'text/plain' });
  await testInfo.attach('exit-code.txt', { body: String(res.status), contentType: 'text/plain' });
  const metaPath = path.join(dir, '.starter-meta.json');
  if (fs.existsSync(metaPath)) {
    await testInfo.attach('starter-meta.json', {
      path: metaPath,
      contentType: 'application/json',
    });
  }
}

test.describe('CLI install flow', () => {
  test('dry-run leaves the target directory untouched', async ({}, testInfo) => {
    const dir = mkTmp();
    try {
      writeFile(dir, 'package.json', '{"name":"test","dependencies":{"next":"14.0.0"}}');
      const before = fs.readdirSync(dir).sort();
      const res = runCli(['--dry-run', '--yes', '--cli', 'skip', '--append-gitignore', 'no'], dir);
      await attachEvidence(testInfo, res, dir);
      expect(res.status).toBe(0);
      expect(fs.readdirSync(dir).sort()).toEqual(before);
      expect(fs.existsSync(path.join(dir, '.starter-meta.json'))).toBe(false);
    } finally {
      rmTmp(dir);
    }
  });

  test('fresh install creates the documented starter files', async ({}, testInfo) => {
    const dir = mkTmp();
    try {
      writeFile(dir, 'package.json', '{"name":"my-product","dependencies":{"next":"14.0.0"}}');
      const res = runCli(['--yes', '--cli', 'skip', '--append-gitignore', 'no'], dir);
      await attachEvidence(testInfo, res, dir);
      expect(res.status, res.stderr).toBe(0);
      for (const required of ['.starter-meta.json', 'AGENTS.md', 'CLAUDE.md', '.specs']) {
        expect(fs.existsSync(path.join(dir, required)), `missing ${required}`).toBe(true);
      }
      const meta = JSON.parse(fs.readFileSync(path.join(dir, '.starter-meta.json'), 'utf8'));
      expect(meta.product_name).toBeTruthy();
      expect(meta.stack).toBeTruthy();
      expect(Array.isArray(meta.read_only_globs)).toBe(true);
      expect(['root', 'monorepo']).toContain(meta.project_mode);
    } finally {
      rmTmp(dir);
    }
  });

  test('detects Next.js + React from package.json dependencies', async ({}, testInfo) => {
    const dir = mkTmp();
    try {
      writeFile(dir, 'package.json',
        '{"name":"next-app","dependencies":{"next":"14.0.0","react":"18.0.0"}}');
      const res = runCli(['--yes', '--cli', 'skip', '--append-gitignore', 'no'], dir);
      await attachEvidence(testInfo, res, dir);
      expect(res.status, res.stderr).toBe(0);
      const meta = JSON.parse(fs.readFileSync(path.join(dir, '.starter-meta.json'), 'utf8'));
      expect(meta.stack.toLowerCase()).toMatch(/next|react/);
    } finally {
      rmTmp(dir);
    }
  });

  test('detects monorepo when apps/ has ≥2 manifests', async ({}, testInfo) => {
    const dir = mkTmp();
    try {
      writeFile(dir, 'package.json', '{"name":"root","workspaces":["apps/*"]}');
      writeFile(dir, 'apps/web/package.json',
        '{"name":"web","dependencies":{"next":"14.0.0"}}');
      writeFile(dir, 'apps/api/package.json',
        '{"name":"api","dependencies":{"express":"4.18.0"}}');
      const res = runCli(['--yes', '--cli', 'skip', '--append-gitignore', 'no'], dir);
      await attachEvidence(testInfo, res, dir);
      expect(res.status, res.stderr).toBe(0);
      const meta = JSON.parse(fs.readFileSync(path.join(dir, '.starter-meta.json'), 'utf8'));
      expect(meta.project_mode).toBe('monorepo');
      expect(Array.isArray(meta.projects)).toBe(true);
      expect(meta.projects.length).toBeGreaterThanOrEqual(2);
    } finally {
      rmTmp(dir);
    }
  });

  test('preserves a pre-existing AGENTS.md and flags it in starter-meta', async ({}, testInfo) => {
    const dir = mkTmp();
    try {
      writeFile(dir, 'package.json',
        '{"name":"test","dependencies":{"react":"18.0.0"}}');
      writeFile(dir, 'AGENTS.md', '# HOST AGENTS\n\nDo not destroy this content.\n');
      const res = runCli(['--yes', '--cli', 'skip', '--append-gitignore', 'no'], dir);
      await attachEvidence(testInfo, res, dir);
      expect(res.status, res.stderr).toBe(0);
      const after = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
      expect(after).toMatch(/HOST AGENTS/);
      const meta = JSON.parse(fs.readFileSync(path.join(dir, '.starter-meta.json'), 'utf8'));
      expect(meta.existing_instruction_files).toContain('AGENTS.md');
    } finally {
      rmTmp(dir);
    }
  });

  test('does not modify package.json (read-only glob)', async ({}, testInfo) => {
    const dir = mkTmp();
    try {
      const original = '{"name":"test","dependencies":{"react":"18.0.0"}}';
      writeFile(dir, 'package.json', original);
      const res = runCli(['--yes', '--cli', 'skip', '--append-gitignore', 'no'], dir);
      await attachEvidence(testInfo, res, dir);
      expect(res.status, res.stderr).toBe(0);
      expect(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).toBe(original);
    } finally {
      rmTmp(dir);
    }
  });

  test('re-run with --update keeps existing instruction files', async ({}, testInfo) => {
    const dir = mkTmp();
    try {
      writeFile(dir, 'package.json',
        '{"name":"test","dependencies":{"react":"18.0.0"}}');
      const r1 = runCli(['--yes', '--cli', 'skip', '--append-gitignore', 'no'], dir);
      expect(r1.status, r1.stderr).toBe(0);
      const agents1 = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
      // Stamp the file to ensure a re-run with --update preserves the user-added content
      fs.appendFileSync(path.join(dir, 'AGENTS.md'), '\n<!-- USER_MARKER_42 -->\n');
      const r2 = runCli(['--update'], dir);
      await attachEvidence(testInfo, r2, dir);
      expect(r2.status, r2.stderr).toBe(0);
      const agents2 = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
      expect(agents2).toContain('USER_MARKER_42');
      expect(agents2.length).toBeGreaterThanOrEqual(agents1.length);
    } finally {
      rmTmp(dir);
    }
  });
});
