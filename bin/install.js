#!/usr/bin/env node

/**
 * agents-install — Copies agent prompts & config files to all supported tools.
 *
 * Destinations:
 *   .claude/agents/       ← Claude Code (all agent .md files)
 *   .github/              ← GitHub Copilot (copilot-instructions.md)
 *   .github/instructions/ ← GitHub Copilot (scoped instructions)
 *   .amazonq/rules/       ← Amazon Q Developer
 *   ./                    ← Aider (CONVENTIONS.md + .aider.conf.yml)
 *   .codex/               ← OpenAI Codex CLI (system prompts)
 *
 * Usage:
 *   npx agents-library                  (install everything, prompt on conflicts)
 *   npx agents-library --force          (overwrite all without prompting)
 *   npx agents-library --dry-run        (preview without writing)
 *   npx agents-library --target <dir>   (install into a specific directory)
 */

'use strict';

const path = require('path');
const { createContext, MANIFEST_FILE, RESET, GREEN, YELLOW, RED, CYAN, BOLD, DIM } = require('./_lib');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args      = process.argv.slice(2);
const FORCE     = args.includes('--force');
const DRY_RUN   = args.includes('--dry-run');
const targetIdx = args.indexOf('--target');
const TARGET    = targetIdx !== -1 ? path.resolve(args[targetIdx + 1]) : process.cwd();
const PKG_ROOT  = path.resolve(__dirname, '..');

// Skip when running inside the package's own directory (e.g. during development).
if (path.resolve(TARGET) === path.resolve(PKG_ROOT)) process.exit(0);

// Skip postinstall during global install — user must run `agents-install` manually.
if (process.env.npm_config_global === 'true') {
  console.log();
  console.log('  agents-library installed globally.');
  console.log(`  Run \x1b[36magents-install\x1b[0m from your project directory to install agent configs.`);
  console.log();
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const ctx = createContext({ TARGET, PKG_ROOT, DRY_RUN, FORCE });
  const { log, ensureDir, hashFile, buildInstallMap, updateGitignore, writeManifest, copyFile,
          IS_INTERACTIVE, closeReadline } = ctx;

  const PKG_VERSION = require('../package.json').version;

  console.log();
  console.log(`${BOLD}${CYAN}agents-install${RESET} — AI agent prompts for all tools`);
  if (DRY_RUN)         console.log(`${YELLOW}  (dry run — no files will be written)${RESET}`);
  if (!IS_INTERACTIVE) console.log(`${DIM}  (non-interactive — conflicts will be skipped)${RESET}`);
  console.log(`  Target  : ${DIM}${TARGET}${RESET}`);
  console.log(`  Source  : ${DIM}${PKG_ROOT}${RESET}`);
  console.log(`  Version : ${DIM}${PKG_VERSION}${RESET}`);
  console.log();

  // Always create destination directories.
  ensureDir(path.join(TARGET, '.claude',  'agents'));
  ensureDir(path.join(TARGET, '.github',  'instructions'));
  ensureDir(path.join(TARGET, '.amazonq', 'rules'));
  ensureDir(path.join(TARGET, '.codex'));

  const installMap   = buildInstallMap();
  const fileHashes   = {};

  let totalInstalled = 0;
  let totalSkipped   = 0;
  let totalMissing   = 0;

  for (const section of installMap) {
    console.log(`${BOLD}${section.label}${RESET}`);

    for (const { src, dest } of section.files) {
      const relDest = path.relative(TARGET, dest);
      const result  = await copyFile(src, dest);

      switch (result) {
        case 'copied':
        case 'would-copy':
          log('✓', GREEN, relDest);
          totalInstalled++;
          break;
        case 'up-to-date':
        case 'would-overwrite':
          log('=', DIM, `${relDest}  ${DIM}(already up to date)${RESET}`);
          totalInstalled++;
          break;
        case 'overwritten':
          log('↺', YELLOW, `${relDest}  ${DIM}(overwritten)${RESET}`);
          totalInstalled++;
          break;
        case 'appended':
          log('+', CYAN, `${relDest}  ${DIM}(appended)${RESET}`);
          totalInstalled++;
          break;
        case 'backed-up':
          log('↺', CYAN, `${relDest}  ${DIM}(old saved as .bak)${RESET}`);
          totalInstalled++;
          break;
        case 'would-conflict':
          log('!', YELLOW, `${relDest}  ${DIM}(modified — would prompt)${RESET}`);
          totalSkipped++;
          break;
        case 'skipped':
          log('–', DIM, `${relDest}  ${DIM}(skipped)${RESET}`);
          totalSkipped++;
          break;
        case 'missing':
          log('✗', RED, `${relDest}  ${DIM}(source not found: ${src})${RESET}`);
          totalMissing++;
          break;
      }

      // Record hash of the installed file for future update comparisons.
      const h = hashFile(dest);
      if (h) fileHashes[relDest] = h;
    }

    console.log();
  }

  // ── .gitignore ─────────────────────────────────────────────────────────────
  console.log(`${BOLD}.gitignore${RESET}`);
  updateGitignore();
  console.log();

  // ── Manifest ───────────────────────────────────────────────────────────────
  writeManifest(PKG_VERSION, fileHashes);
  if (!DRY_RUN) log('✓', DIM, `${MANIFEST_FILE}  ${DIM}(manifest written)${RESET}`);
  console.log();

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log(`${BOLD}Summary${RESET}`);
  if (totalInstalled > 0) log('✓', GREEN,  `${totalInstalled} file(s) ${DRY_RUN ? 'to install' : 'installed'}`);
  if (totalSkipped   > 0) log('–', DIM,    `${totalSkipped} file(s) skipped`);
  if (totalMissing   > 0) log('✗', RED,    `${totalMissing} file(s) not found in package`);
  if (!DRY_RUN)           log('i', CYAN,   `run ${BOLD}agents-update${RESET}${CYAN} to pull new versions later`);
  console.log();

  closeReadline();
}

main().catch(err => { console.error(err); process.exit(1); });
