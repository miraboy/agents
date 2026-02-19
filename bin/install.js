#!/usr/bin/env node

/**
 * agents-install — Copies agent prompts & config files to all supported tools.
 *
 * Destinations:
 *   .claude/agents/      ← Claude Code (all agent .md files)
 *   .github/             ← GitHub Copilot (copilot-instructions.md)
 *   .github/instructions/← GitHub Copilot (scoped instructions)
 *   .amazonq/rules/      ← Amazon Q Developer
 *   ./                   ← Aider (CONVENTIONS.md + .aider.conf.yml)
 *   .codex/              ← OpenAI Codex CLI (system prompts)
 *
 * Usage:
 *   npx agents-library                  (install everything)
 *   npx agents-library --force          (overwrite existing files)
 *   npx agents-library --dry-run        (preview without writing)
 *   npx agents-library --target <dir>   (install into a specific directory)
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const FORCE     = args.includes('--force');
const DRY_RUN   = args.includes('--dry-run');
const targetIdx = args.indexOf('--target');
const TARGET    = targetIdx !== -1 ? path.resolve(args[targetIdx + 1]) : process.cwd();
const PKG_ROOT  = path.resolve(__dirname, '..');

// Skip when running inside the package's own directory (e.g. during development).
if (path.resolve(TARGET) === path.resolve(PKG_ROOT)) {
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';

function log(symbol, color, msg) {
  console.log(`  ${color}${symbol}${RESET} ${msg}`);
}

function ensureDir(dir) {
  if (!DRY_RUN && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Copy a single file from src to dest.
 * Returns 'copied' | 'skipped' | 'overwritten' | 'dry'
 */
function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    return 'missing';
  }

  const exists = fs.existsSync(dest);

  if (DRY_RUN) {
    return exists ? 'would-overwrite' : 'would-copy';
  }

  if (exists && !FORCE) {
    return 'skipped';
  }

  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return exists ? 'overwritten' : 'copied';
}

/** Get all .md files from a source directory (non-recursive). */
function getMdFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(dir, f));
}

// ---------------------------------------------------------------------------
// Install map — { label, files: [{ src, dest }] }
// ---------------------------------------------------------------------------

function buildInstallMap() {
  const map = [];

  // ── Claude Code ──────────────────────────────────────────────────────────
  const claudeAgentsDir = path.join(TARGET, '.claude', 'agents');
  const claudeFiles = [
    path.join(PKG_ROOT, 'super-chef.md'),
    ...getMdFiles(path.join(PKG_ROOT, 'agent-dev')),
    ...getMdFiles(path.join(PKG_ROOT, 'agent-com')),
  ];

  map.push({
    label: 'Claude Code (.claude/agents/)',
    files: claudeFiles.map(src => ({
      src,
      dest: path.join(claudeAgentsDir, path.basename(src)),
    })),
  });

  // ── GitHub Copilot ────────────────────────────────────────────────────────
  map.push({
    label: 'GitHub Copilot (.github/)',
    files: [
      {
        src:  path.join(PKG_ROOT, 'adapters', 'github-copilot', 'copilot-instructions.md'),
        dest: path.join(TARGET, '.github', 'copilot-instructions.md'),
      },
      {
        src:  path.join(PKG_ROOT, 'adapters', 'github-copilot', 'instructions', 'dev-team.instructions.md'),
        dest: path.join(TARGET, '.github', 'instructions', 'dev-team.instructions.md'),
      },
      {
        src:  path.join(PKG_ROOT, 'adapters', 'github-copilot', 'instructions', 'comm-team.instructions.md'),
        dest: path.join(TARGET, '.github', 'instructions', 'comm-team.instructions.md'),
      },
    ],
  });

  // ── Amazon Q ─────────────────────────────────────────────────────────────
  map.push({
    label: 'Amazon Q Developer (.amazonq/rules/)',
    files: [
      {
        src:  path.join(PKG_ROOT, 'adapters', 'amazon-q', 'rules', 'dev-team.md'),
        dest: path.join(TARGET, '.amazonq', 'rules', 'dev-team.md'),
      },
      {
        src:  path.join(PKG_ROOT, 'adapters', 'amazon-q', 'rules', 'comm-team.md'),
        dest: path.join(TARGET, '.amazonq', 'rules', 'comm-team.md'),
      },
    ],
  });

  // ── Aider ─────────────────────────────────────────────────────────────────
  map.push({
    label: 'Aider (./)',
    files: [
      {
        src:  path.join(PKG_ROOT, 'adapters', 'aider', 'CONVENTIONS.md'),
        dest: path.join(TARGET, 'CONVENTIONS.md'),
      },
      {
        src:  path.join(PKG_ROOT, 'adapters', 'aider', '.aider.conf.yml'),
        dest: path.join(TARGET, '.aider.conf.yml'),
      },
    ],
  });

  // ── OpenAI Codex CLI ──────────────────────────────────────────────────────
  map.push({
    label: 'OpenAI Codex (.codex/)',
    files: [
      {
        src:  path.join(PKG_ROOT, 'adapters', 'codex', 'system-prompt-dev.txt'),
        dest: path.join(TARGET, '.codex', 'system-prompt-dev.txt'),
      },
      {
        src:  path.join(PKG_ROOT, 'adapters', 'codex', 'system-prompt-comm.txt'),
        dest: path.join(TARGET, '.codex', 'system-prompt-comm.txt'),
      },
      {
        src:  path.join(PKG_ROOT, 'adapters', 'codex', 'system-prompt-full.txt'),
        dest: path.join(TARGET, '.codex', 'system-prompt-full.txt'),
      },
    ],
  });

  return map;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

console.log();
console.log(`${BOLD}${CYAN}agents-install${RESET} — AI agent prompts for all tools`);
if (DRY_RUN) console.log(`${YELLOW}  (dry run — no files will be written)${RESET}`);
console.log(`  Target : ${DIM}${TARGET}${RESET}`);
console.log(`  Source : ${DIM}${PKG_ROOT}${RESET}`);
console.log();

const installMap = buildInstallMap();

let totalCopied = 0;
let totalSkipped = 0;
let totalMissing = 0;

for (const section of installMap) {
  console.log(`${BOLD}${section.label}${RESET}`);

  for (const { src, dest } of section.files) {
    const relDest = path.relative(TARGET, dest);
    const result  = copyFile(src, dest);

    switch (result) {
      case 'copied':
      case 'would-copy':
        log('✓', GREEN, relDest);
        totalCopied++;
        break;
      case 'overwritten':
      case 'would-overwrite':
        log('↺', YELLOW, `${relDest}  ${DIM}(overwritten)${RESET}`);
        totalCopied++;
        break;
      case 'skipped':
        log('–', DIM, `${relDest}  ${DIM}(already exists — use --force to overwrite)${RESET}`);
        totalSkipped++;
        break;
      case 'missing':
        log('✗', RED, `${relDest}  ${DIM}(source not found: ${src})${RESET}`);
        totalMissing++;
        break;
    }
  }

  console.log();
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`${BOLD}Summary${RESET}`);
if (totalCopied  > 0) log('✓', GREEN,  `${totalCopied} file(s) ${DRY_RUN ? 'to copy' : 'copied'}`);
if (totalSkipped > 0) log('–', DIM,    `${totalSkipped} file(s) skipped (already exist)`);
if (totalMissing > 0) log('✗', RED,    `${totalMissing} file(s) not found in package`);

if (!DRY_RUN && totalSkipped > 0) {
  console.log();
  console.log(`  ${DIM}Tip: run with --force to overwrite existing files.${RESET}`);
}

console.log();
