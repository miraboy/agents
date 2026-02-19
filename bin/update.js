#!/usr/bin/env node

/**
 * agents-update — Updates installed agent files from the (global) package.
 *
 * Uses .agents-library.json manifest to distinguish:
 *   - Files the user never touched  → updated silently
 *   - Files the user modified        → interactive prompt (overwrite / append / backup / skip)
 *   - New files added to package     → installed automatically
 *   - Files removed from package     → warned, kept locally
 *
 * Usage:
 *   agents-update                   (smart update, prompt on conflicts)
 *   agents-update --force           (overwrite everything without prompting)
 *   agents-update --dry-run         (preview without writing)
 *   agents-update --target <dir>    (target a specific directory)
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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const ctx = createContext({ TARGET, PKG_ROOT, DRY_RUN, FORCE });
  const { log, ensureDir, hashFile, buildInstallMap, updateGitignore,
          readManifest, writeManifest, updateFile, IS_INTERACTIVE, closeReadline } = ctx;

  const PKG_VERSION = require('../package.json').version;
  const manifest    = readManifest();

  console.log();
  console.log(`${BOLD}${CYAN}agents-update${RESET} — update AI agent prompts from package`);
  if (DRY_RUN)         console.log(`${YELLOW}  (dry run — no files will be written)${RESET}`);
  if (!IS_INTERACTIVE) console.log(`${DIM}  (non-interactive — conflicts will be skipped)${RESET}`);
  console.log(`  Target   : ${DIM}${TARGET}${RESET}`);
  console.log(`  Package  : ${DIM}${PKG_VERSION}${RESET}`);
  if (manifest.version) {
    console.log(`  Installed: ${DIM}${manifest.version}${RESET}`);
  } else {
    console.log(`  ${YELLOW}No manifest found — treating all files as new installs.${RESET}`);
    console.log(`  ${DIM}Run agents-install first for accurate conflict detection.${RESET}`);
  }
  console.log();

  // Ensure directories exist.
  ensureDir(path.join(TARGET, '.claude',  'agents'));
  ensureDir(path.join(TARGET, '.github',  'instructions'));
  ensureDir(path.join(TARGET, '.amazonq', 'rules'));
  ensureDir(path.join(TARGET, '.codex'));

  const installMap    = buildInstallMap();
  const newFileHashes = {};
  const currentFiles  = new Set();

  let totalUpdated  = 0;
  let totalSkipped  = 0;
  let totalMissing  = 0;
  let totalNew      = 0;

  for (const section of installMap) {
    console.log(`${BOLD}${section.label}${RESET}`);

    for (const { src, dest } of section.files) {
      const relDest      = path.relative(TARGET, dest);
      const manifestHash = manifest.files[relDest] || null;

      currentFiles.add(relDest);

      const result = await updateFile(src, dest, manifestHash);

      switch (result) {
        case 'copied':
        case 'would-copy':
          log('✓', GREEN, `${relDest}  ${DIM}(new)${RESET}`);
          totalNew++;
          break;
        case 'updated':
        case 'would-update':
          log('↑', GREEN, `${relDest}  ${DIM}(updated)${RESET}`);
          totalUpdated++;
          break;
        case 'up-to-date':
          log('=', DIM, `${relDest}  ${DIM}(up to date)${RESET}`);
          break;
        case 'overwritten':
          log('↺', YELLOW, `${relDest}  ${DIM}(overwritten)${RESET}`);
          totalUpdated++;
          break;
        case 'appended':
          log('+', CYAN, `${relDest}  ${DIM}(appended)${RESET}`);
          totalUpdated++;
          break;
        case 'backed-up':
          log('↺', CYAN, `${relDest}  ${DIM}(old saved as .bak)${RESET}`);
          totalUpdated++;
          break;
        case 'would-conflict':
          log('!', YELLOW, `${relDest}  ${DIM}(modified — would prompt)${RESET}`);
          totalSkipped++;
          break;
        case 'skipped':
          log('–', DIM, `${relDest}  ${DIM}(skipped — has local modifications)${RESET}`);
          totalSkipped++;
          break;
        case 'missing':
          log('✗', RED, `${relDest}  ${DIM}(source not found: ${src})${RESET}`);
          totalMissing++;
          break;
      }

      // Record the current dest hash for the new manifest.
      const h = hashFile(dest);
      if (h) newFileHashes[relDest] = h;
    }

    console.log();
  }

  // ── Detect files removed from package ─────────────────────────────────────

  const removed = Object.keys(manifest.files).filter(f => !currentFiles.has(f));
  if (removed.length > 0) {
    console.log(`${BOLD}Removed from package${RESET}`);
    for (const f of removed) {
      log('?', YELLOW, `${f}  ${DIM}(no longer in package — kept locally)${RESET}`);
      // Keep existing dest hash so it's still tracked.
      const h = hashFile(path.join(TARGET, f));
      if (h) newFileHashes[f] = h;
    }
    console.log();
  }

  // ── .gitignore ─────────────────────────────────────────────────────────────
  console.log(`${BOLD}.gitignore${RESET}`);
  updateGitignore();
  console.log();

  // ── Manifest ───────────────────────────────────────────────────────────────
  writeManifest(PKG_VERSION, newFileHashes);
  if (!DRY_RUN) log('✓', DIM, `${MANIFEST_FILE}  ${DIM}(manifest updated)${RESET}`);
  console.log();

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log(`${BOLD}Summary${RESET}`);
  const totalChanged = totalNew + totalUpdated;
  if (totalChanged > 0) log('✓', GREEN,  `${totalChanged} file(s) ${DRY_RUN ? 'to update' : 'updated'} (${totalNew} new, ${totalUpdated} updated)`);
  if (totalSkipped > 0) log('–', DIM,    `${totalSkipped} file(s) skipped (local modifications)`);
  if (totalMissing > 0) log('✗', RED,    `${totalMissing} file(s) not found in package`);
  if (removed.length > 0) log('?', YELLOW, `${removed.length} file(s) removed from package (kept locally)`);
  if (totalChanged === 0 && totalSkipped === 0 && totalMissing === 0)
    log('=', DIM, 'everything is already up to date');
  console.log();

  closeReadline();
}

main().catch(err => { console.error(err); process.exit(1); });
