#!/usr/bin/env node

/**
 * agents-uninstall — Removes all files installed by agents-library.
 *
 * Usage:
 *   npx agents-uninstall                  (remove installed files)
 *   npx agents-uninstall --dry-run        (preview without deleting)
 *   npx agents-uninstall --target <dir>   (target a specific directory)
 */

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args      = process.argv.slice(2);
const DRY_RUN   = args.includes('--dry-run');
const targetIdx = args.indexOf('--target');
const TARGET    = targetIdx !== -1 ? path.resolve(args[targetIdx + 1]) : process.cwd();
const PKG_ROOT  = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Colours
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

// ---------------------------------------------------------------------------
// File list — mirrors buildInstallMap() in install.js
// ---------------------------------------------------------------------------

function getMdFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.basename(f));
}

function buildFileList() {
  const files = [];

  // Claude Code
  const claudeAgentsDir = path.join(TARGET, '.claude', 'agents');
  const agentFiles = [
    'super-chef.md',
    ...getMdFiles(path.join(PKG_ROOT, 'agent-dev')),
    ...getMdFiles(path.join(PKG_ROOT, 'agent-com')),
  ];
  agentFiles.forEach(f => files.push(path.join(claudeAgentsDir, f)));

  // GitHub Copilot
  files.push(path.join(TARGET, '.github', 'copilot-instructions.md'));
  files.push(path.join(TARGET, '.github', 'instructions', 'dev-team.instructions.md'));
  files.push(path.join(TARGET, '.github', 'instructions', 'comm-team.instructions.md'));

  // Amazon Q
  files.push(path.join(TARGET, '.amazonq', 'rules', 'dev-team.md'));
  files.push(path.join(TARGET, '.amazonq', 'rules', 'comm-team.md'));

  // Aider
  files.push(path.join(TARGET, 'CONVENTIONS.md'));
  files.push(path.join(TARGET, '.aider.conf.yml'));

  // OpenAI Codex
  files.push(path.join(TARGET, '.codex', 'system-prompt-dev.txt'));
  files.push(path.join(TARGET, '.codex', 'system-prompt-comm.txt'));
  files.push(path.join(TARGET, '.codex', 'system-prompt-full.txt'));

  return files;
}

// Directories to prune if empty after file removal (deepest first).
const DIRS_TO_PRUNE = [
  path.join(TARGET, '.claude',  'agents'),
  path.join(TARGET, '.github',  'instructions'),
  path.join(TARGET, '.amazonq', 'rules'),
  path.join(TARGET, '.amazonq'),
  path.join(TARGET, '.codex'),
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function removeFile(filePath) {
  const rel = path.relative(TARGET, filePath);

  if (!fs.existsSync(filePath)) {
    log('–', DIM, `${rel}  ${DIM}(not found, skipped)${RESET}`);
    return 'skipped';
  }

  if (DRY_RUN) {
    log('✓', YELLOW, `${rel}  ${DIM}(would remove)${RESET}`);
    return 'dry';
  }

  fs.unlinkSync(filePath);
  log('✓', GREEN, rel);
  return 'removed';
}

function pruneDir(dir) {
  if (!fs.existsSync(dir)) return;

  const rel = path.relative(TARGET, dir);
  const isEmpty = fs.readdirSync(dir).length === 0;

  if (!isEmpty) return;

  if (DRY_RUN) {
    log('✓', YELLOW, `${rel}/  ${DIM}(would remove empty dir)${RESET}`);
    return;
  }

  fs.rmdirSync(dir);
  log('✓', GREEN, `${rel}/  ${DIM}(empty dir removed)${RESET}`);
}

// ---------------------------------------------------------------------------
// .gitignore — remove agents-library block
// ---------------------------------------------------------------------------

const GITIGNORE_MARKER_START = '# agents-library [start]';
const GITIGNORE_MARKER_END   = '# agents-library [end]';

function cleanGitignore() {
  const gitignorePath = path.join(TARGET, '.gitignore');

  if (!fs.existsSync(gitignorePath)) return;

  const current = fs.readFileSync(gitignorePath, 'utf8');
  if (!current.includes(GITIGNORE_MARKER_START)) {
    log('–', DIM, `.gitignore  ${DIM}(no agents-library block found)${RESET}`);
    return;
  }

  if (DRY_RUN) {
    log('✓', YELLOW, `.gitignore  ${DIM}(would remove agents-library block)${RESET}`);
    return;
  }

  const updated = current
    .replace(
      new RegExp(`\\n?${GITIGNORE_MARKER_START}[\\s\\S]*?${GITIGNORE_MARKER_END}\\n?`, 'g'),
      '',
    )
    .trimEnd();

  fs.writeFileSync(gitignorePath, updated.length > 0 ? updated + '\n' : '', 'utf8');
  log('✓', GREEN, `.gitignore`);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

console.log();
console.log(`${BOLD}${CYAN}agents-uninstall${RESET} — remove AI agent prompts from all tools`);
if (DRY_RUN) console.log(`${YELLOW}  (dry run — no files will be deleted)${RESET}`);
console.log(`  Target : ${DIM}${TARGET}${RESET}`);
console.log();

let totalRemoved = 0;
let totalSkipped = 0;

// ── Files ─────────────────────────────────────────────────────────────────────

console.log(`${BOLD}Files${RESET}`);
for (const f of buildFileList()) {
  const result = removeFile(f);
  if (result === 'removed') totalRemoved++;
  else if (result === 'skipped') totalSkipped++;
}
console.log();

// ── Empty directories ─────────────────────────────────────────────────────────

console.log(`${BOLD}Directories${RESET}`);
for (const dir of DIRS_TO_PRUNE) pruneDir(dir);
console.log();

// ── Manifest ──────────────────────────────────────────────────────────────────

const manifestPath = path.join(TARGET, '.agents-library.json');
console.log(`${BOLD}Manifest${RESET}`);
if (fs.existsSync(manifestPath)) {
  if (DRY_RUN) {
    log('✓', YELLOW, `.agents-library.json  ${DIM}(would remove)${RESET}`);
  } else {
    fs.unlinkSync(manifestPath);
    log('✓', GREEN, `.agents-library.json`);
    totalRemoved++;
  }
} else {
  log('–', DIM, `.agents-library.json  ${DIM}(not found, skipped)${RESET}`);
}
console.log();

// ── .gitignore ────────────────────────────────────────────────────────────────

console.log(`${BOLD}.gitignore${RESET}`);
cleanGitignore();
console.log();

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`${BOLD}Summary${RESET}`);
if (totalRemoved > 0) log('✓', GREEN, `${totalRemoved} file(s) ${DRY_RUN ? 'to remove' : 'removed'}`);
if (totalSkipped > 0) log('–', DIM,   `${totalSkipped} file(s) not found`);
console.log();
