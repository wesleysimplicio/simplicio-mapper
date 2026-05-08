#!/usr/bin/env node
/**
 * Agentic Starter - CLI scaffolder.
 *
 * Run inside any project to install the starter pack:
 *   npx @wesleysimplicio/agentic-starter
 *   npx @wesleysimplicio/agentic-starter --product MyApp --team Squad-X --domain fintech --stack next-ts
 *
 * Pure Node.js. No bash dependency. Works on macOS, Linux, and Windows.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const CWD = process.cwd();
const PKG = require(path.join(PACKAGE_ROOT, 'package.json'));

// ---------------------------------------------------------------------------
// template paths to copy into cwd
// ---------------------------------------------------------------------------
const TEMPLATE_PATHS = [
  'AGENTS.md',
  'CLAUDE.md',
  'INIT.md',
  '_BOOTSTRAP.md',
  '.agents',
  '.claude',
  '.codex',
  '.github',
  '.skills',
  '.specs',
  'bootstrap.sh',
  'bootstrap.ps1',
  'playwright.config.ts',
  'tests',
];

// substitution pass: file extensions to scan for placeholders
const TEXT_EXTS = new Set([
  '.md', '.json', '.toml', '.yml', '.yaml', '.ts', '.tsx', '.js', '.mjs', '.cjs',
]);

// files where placeholders must NOT be substituted (instruction templates)
const SUBSTITUTE_EXCLUDE_BASENAMES = new Set([
  '_BOOTSTRAP.md',
  'INIT.md',
  'bootstrap.sh',
  'bootstrap.ps1',
  'cli.js',
]);

// directories to skip on substitution walk
const WALK_SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  '.next',
  '.nuxt',
  'coverage',
  'playwright-report',
  'test-results',
]);

// inline content: avoids npm publish quirks with .gitignore (npm renames it
// to .npmignore in the published tarball when listed in `files`)
const GITIGNORE_CONTENT = `# Dependencies
node_modules/
jspm_packages/
bower_components/

# Build / dist
dist/
build/
out/
.next/
.nuxt/
.svelte-kit/
.turbo/
.vercel/

# TypeScript
*.tsbuildinfo

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Env vars
.env
.env.*
!.env.example

# Test artifacts
test-results/
playwright-report/
playwright/.cache/
coverage/
.nyc_output/

# Editor / OS
.DS_Store
Thumbs.db
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
*.swp
*.swo

# Lint cache
.eslintcache
.stylelintcache
.parcel-cache

# Claude / Codex local state
.codex/local
.codex/history
.claude/sessions
.claude/cache

# Tarballs / debug
*.tgz
*.tar.gz
.pnpm-store/
`;

const GITATTRIBUTES_CONTENT = `# Cross-platform line endings.
* text=auto eol=lf

# Shell scripts MUST be LF.
*.sh        text eol=lf
*.bash      text eol=lf

# Windows scripts MUST be CRLF.
*.ps1       text eol=crlf
*.psm1      text eol=crlf
*.psd1      text eol=crlf
*.bat       text eol=crlf
*.cmd       text eol=crlf

# Common config / source.
*.md        text
*.json      text
*.jsonc     text
*.yml       text
*.yaml      text
*.toml      text
*.xml       text
*.html      text
*.css       text
*.scss      text
*.js        text
*.jsx       text
*.ts        text
*.tsx       text
*.mjs       text
*.cjs       text
*.py        text
*.cs        text
*.csproj    text
*.sln       text eol=crlf
*.go        text
*.rs        text
*.java      text
*.kt        text
*.kts       text
*.gradle    text

# Binaries: never normalize.
*.png       binary
*.jpg       binary
*.jpeg      binary
*.gif       binary
*.ico       binary
*.pdf       binary
*.zip       binary
*.gz        binary
*.tar       binary
*.7z        binary
*.exe       binary
*.dll       binary
*.so        binary
*.dylib     binary
*.woff      binary
*.woff2     binary
*.ttf       binary
*.eot       binary
*.mp3       binary
*.mp4       binary
*.mov       binary

# Lockfiles: text but no noisy diff.
package-lock.json    text -diff
pnpm-lock.yaml       text -diff
yarn.lock            text -diff
poetry.lock          text -diff
Cargo.lock           text -diff
`;

// ---------------------------------------------------------------------------
// args
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const opts = {
  product: '',
  team: '',
  domain: '',
  stack: '',
  force: false,
  yes: false,
  dryRun: false,
  silent: false,
  skipMeta: false,
  skipGitignore: false,
  interactive: true,
};

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  switch (a) {
    case '--product':       opts.product = argv[++i]; opts.interactive = false; break;
    case '--team':          opts.team = argv[++i]; opts.interactive = false; break;
    case '--domain':        opts.domain = argv[++i]; opts.interactive = false; break;
    case '--stack':         opts.stack = argv[++i]; opts.interactive = false; break;
    case '-f':
    case '--force':         opts.force = true; break;
    case '-y':
    case '--yes':           opts.yes = true; opts.interactive = false; break;
    case '--dry-run':       opts.dryRun = true; break;
    case '--silent':        opts.silent = true; break;
    case '--skip-meta':     opts.skipMeta = true; break;
    case '--skip-gitignore': opts.skipGitignore = true; break;
    case '-v':
    case '--version':
      console.log(PKG.version);
      process.exit(0);
    case '-h':
    case '--help':
      printHelp();
      process.exit(0);
    default:
      console.error(`Unknown flag: ${a}`);
      console.error('Run with --help for usage.');
      process.exit(2);
  }
}

function printHelp() {
  console.log(`agentic-starter v${PKG.version}

Scaffold the Agentic Starter pack into the current directory.

USAGE
  npx @wesleysimplicio/agentic-starter [options]

OPTIONS
  --product <name>    Product name (default: cwd basename)
  --team <name>       Team / squad (default: Plataforma)
  --domain <name>     Business domain (default: generico)
  --stack <name>      Tech stack (default: auto-detected)
  -f, --force         Overwrite existing files
  -y, --yes           Non-interactive (use defaults / flags only)
  --dry-run           Print actions without writing files
  --skip-meta         Do not write .starter-meta.json
  --skip-gitignore    Do not create .gitignore / .gitattributes
  --silent            Minimal output
  -v, --version       Print version
  -h, --help          Show this help

EXAMPLES
  # interactive
  npx @wesleysimplicio/agentic-starter

  # CI / non-interactive
  npx @wesleysimplicio/agentic-starter \\
    --product "MyApp" --team "Squad-X" --domain "fintech" --stack "next-ts" --yes

  # preview without writing
  npx @wesleysimplicio/agentic-starter --dry-run --yes

DOCS
  https://github.com/wesleysimplicio/agentic-starter
`);
}

// ---------------------------------------------------------------------------
// logging
// ---------------------------------------------------------------------------
const log = (...a) => { if (!opts.silent) console.log(...a); };
const err = (...a) => console.error(...a);

// ---------------------------------------------------------------------------
// stack detection (mirrors bootstrap.sh)
// ---------------------------------------------------------------------------
function readSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}
function existsHere(rel) {
  return fs.existsSync(path.join(CWD, rel));
}
function listCwd() {
  try { return fs.readdirSync(CWD); } catch { return []; }
}

function detectStack() {
  if (existsHere('package.json')) {
    const pj = readSafe(path.join(CWD, 'package.json'));
    if (/"next"\s*:/.test(pj))                    return 'next-ts';
    if (/"react"\s*:/.test(pj))                   return 'react-ts';
    if (/"vue"\s*:/.test(pj))                     return 'vue-ts';
    if (/"@nestjs\/core"|"nestjs"\s*:/.test(pj))  return 'nestjs';
    if (/"express"\s*:/.test(pj))                 return 'node-express';
    return 'node-ts';
  }
  const files = listCwd();
  if (files.some(f => f.endsWith('.csproj') || f.endsWith('.sln'))) return 'dotnet';
  if (existsHere('pyproject.toml') || existsHere('requirements.txt')) {
    const py = readSafe(path.join(CWD, 'pyproject.toml')) + readSafe(path.join(CWD, 'requirements.txt'));
    if (/django/i.test(py))   return 'python-django';
    if (/fastapi/i.test(py))  return 'python-fastapi';
    if (/flask/i.test(py))    return 'python-flask';
    return 'python';
  }
  if (existsHere('go.mod'))         return 'go';
  if (existsHere('Cargo.toml'))     return 'rust';
  if (existsHere('pubspec.yaml'))   return 'flutter';
  if (existsHere('composer.json')) {
    return /laravel\/framework/.test(readSafe(path.join(CWD, 'composer.json'))) ? 'laravel' : 'php';
  }
  if (existsHere('Gemfile'))           return 'ruby';
  if (existsHere('mix.exs'))           return 'elixir';
  if (existsHere('build.gradle.kts'))  return 'kotlin-gradle';
  if (existsHere('build.gradle'))      return 'java-gradle';
  if (existsHere('pom.xml'))           return 'java-maven';
  return 'unknown';
}

// ---------------------------------------------------------------------------
// interactive prompts
// ---------------------------------------------------------------------------
function ask(rl, q, def) {
  return new Promise(resolve => {
    rl.question(`${q} [${def}]: `, ans => resolve((ans || '').trim() || def));
  });
}

async function promptInputs() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  log('==========================================');
  log('  Agentic Starter - Bootstrap');
  log(`  v${PKG.version}`);
  log('==========================================\n');
  if (!opts.product) opts.product = await ask(rl, 'Product name', path.basename(CWD));
  if (!opts.team)    opts.team    = await ask(rl, 'Team / squad', 'Plataforma');
  if (!opts.domain)  opts.domain  = await ask(rl, 'Business domain (e.g. fintech, healthtech)', 'generico');
  if (!opts.stack)   opts.stack   = await ask(rl, 'Stack', detectStack());
  rl.close();
}

// ---------------------------------------------------------------------------
// copy template
// ---------------------------------------------------------------------------
function copyTemplate() {
  let copied = 0;
  let skipped = 0;
  let missing = 0;

  for (const rel of TEMPLATE_PATHS) {
    const src = path.join(PACKAGE_ROOT, rel);
    const dest = path.join(CWD, rel);

    if (!fs.existsSync(src)) {
      missing++;
      continue;
    }
    if (fs.existsSync(dest) && !opts.force) {
      skipped++;
      log(`  skip  (exists): ${rel}`);
      continue;
    }
    if (opts.dryRun) {
      log(`  copy  (dry):    ${rel}`);
      copied++;
      continue;
    }
    try {
      fs.cpSync(src, dest, { recursive: true, force: true });
      log(`  copy:           ${rel}`);
      copied++;
    } catch (e) {
      err(`  fail  ${rel}: ${e.message}`);
    }
  }

  log(`\n→ ${copied} copied, ${skipped} skipped${opts.force ? '' : ' (use --force to overwrite)'}, ${missing} missing in package.\n`);
  return { copied, skipped, missing };
}

function writeGitFiles() {
  if (opts.skipGitignore) return;
  const targets = [
    { name: '.gitignore',     content: GITIGNORE_CONTENT },
    { name: '.gitattributes', content: GITATTRIBUTES_CONTENT },
  ];
  for (const t of targets) {
    const dest = path.join(CWD, t.name);
    if (fs.existsSync(dest) && !opts.force) {
      log(`  skip  (exists): ${t.name}`);
      continue;
    }
    if (opts.dryRun) {
      log(`  write (dry):    ${t.name}`);
      continue;
    }
    fs.writeFileSync(dest, t.content);
    log(`  write:          ${t.name}`);
  }
}

// ---------------------------------------------------------------------------
// placeholder substitution
// ---------------------------------------------------------------------------
function walk(dir, cb) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return; }

  for (const entry of entries) {
    if (WALK_SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, cb);
    } else if (entry.isFile()) {
      cb(full);
    }
  }
}

function substitute() {
  const subs = [
    [/<PRODUCT_NAME>/g, opts.product],
    [/<TEAM>/g,         opts.team],
    [/<DOMAIN>/g,       opts.domain],
    [/<STACK>/g,        opts.stack],
  ];
  let touched = 0;

  walk(CWD, (file) => {
    const base = path.basename(file);
    if (SUBSTITUTE_EXCLUDE_BASENAMES.has(base)) return;
    if (!TEXT_EXTS.has(path.extname(file))) return;

    let content;
    try { content = fs.readFileSync(file, 'utf8'); }
    catch { return; }

    let next = content;
    for (const [re, val] of subs) next = next.replace(re, val);
    if (next !== content) {
      if (!opts.dryRun) fs.writeFileSync(file, next);
      touched++;
    }
  });

  log(`→ ${touched} files had placeholders substituted${opts.dryRun ? ' (dry-run)' : ''}.\n`);
}

// ---------------------------------------------------------------------------
// .starter-meta.json
// ---------------------------------------------------------------------------
function writeMeta() {
  if (opts.skipMeta) return;
  const meta = {
    product_name: opts.product,
    team: opts.team,
    domain: opts.domain,
    stack: opts.stack,
    bootstrapped_at: new Date().toISOString(),
    starter_version: PKG.version,
    cli: '@wesleysimplicio/agentic-starter',
  };
  const dest = path.join(CWD, '.starter-meta.json');
  if (opts.dryRun) {
    log(`  write (dry):    .starter-meta.json`);
    return;
  }
  fs.writeFileSync(dest, JSON.stringify(meta, null, 2) + '\n');
  log('→ .starter-meta.json saved.\n');
}

// ---------------------------------------------------------------------------
// next steps banner
// ---------------------------------------------------------------------------
function printNextSteps() {
  log(`=========================================
  NEXT STEPS
=========================================

1) Open an agent in this folder:

   - Claude Code:  claude "Read INIT.md and execute. Map this repo and fill .specs/product/ + .specs/architecture/ with real data. Use parallel multi-agents."
   - Codex CLI:    codex exec "Read INIT.md and execute..."
   - Copilot:      gh copilot chat   (or VS Code Agent Mode)

2) Review .specs/product/VISION.md, DOMAIN.md, architecture/DESIGN.md.
   Create your first task in .specs/sprints/sprint-01/.

3) git add -A && git commit -m "chore: bootstrap agentic starter"

4) (optional) Remove _BOOTSTRAP.md + INIT.md + bootstrap.{sh,ps1}
   if you do not want them in the final repo.

Docs: https://github.com/wesleysimplicio/agentic-starter
`);
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function main() {
  // refuse to scaffold over the package source itself by accident
  if (path.resolve(CWD) === path.resolve(PACKAGE_ROOT)) {
    err('Refusing to scaffold into the package source directory.');
    err('Run this command from inside the project where you want the starter.');
    process.exit(2);
  }

  if (opts.interactive && !opts.yes) {
    await promptInputs();
  }

  // fallback defaults
  opts.product = opts.product || path.basename(CWD);
  opts.team    = opts.team    || 'Plataforma';
  opts.domain  = opts.domain  || 'generico';
  opts.stack   = opts.stack   || detectStack();

  log(`→ PRODUCT_NAME: ${opts.product}`);
  log(`→ TEAM:         ${opts.team}`);
  log(`→ DOMAIN:       ${opts.domain}`);
  log(`→ STACK:        ${opts.stack}`);
  log(`→ MODE:         ${opts.dryRun ? 'dry-run' : 'write'}${opts.force ? ' (force)' : ''}\n`);

  copyTemplate();
  writeGitFiles();
  substitute();
  writeMeta();
  printNextSteps();
}

main().catch(e => {
  err('Error:', e && e.stack || e);
  process.exit(1);
});
