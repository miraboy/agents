/**
 * _lib.js — shared context factory for agents-install / agents-update / agents-uninstall.
 *
 * Usage:
 *   const { createContext, MANIFEST_FILE, RESET, GREEN, ... } = require('./_lib');
 *   const ctx = createContext({ TARGET, PKG_ROOT, DRY_RUN, FORCE });
 */

'use strict';

const fs       = require('fs');
const path     = require('path');
const readline = require('readline');
const crypto   = require('crypto');

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

// ---------------------------------------------------------------------------
// Manifest filename
// ---------------------------------------------------------------------------

const MANIFEST_FILE = '.agents-library.json';

// ---------------------------------------------------------------------------
// Context factory
// ---------------------------------------------------------------------------

function createContext({ TARGET, PKG_ROOT, DRY_RUN = false, FORCE = false }) {
  const IS_INTERACTIVE = process.stdin.isTTY === true;
  let rl;

  // ── Basic helpers ─────────────────────────────────────────────────────────

  function log(symbol, color, msg) {
    console.log(`  ${color}${symbol}${RESET} ${msg}`);
  }

  function ensureDir(dir) {
    if (!DRY_RUN && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  function hashFile(filePath) {
    if (!fs.existsSync(filePath)) return null;
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
  }

  function getMdFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(dir, f));
  }

  // ── Install map ───────────────────────────────────────────────────────────

  function buildInstallMap() {
    const map = [];

    // Claude Code
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

    // GitHub Copilot
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

    // Amazon Q
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

    // Aider
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

    // OpenAI Codex
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

  // ── .gitignore ────────────────────────────────────────────────────────────

  const GITIGNORE_MARKER_START = '# agents-library [start]';
  const GITIGNORE_MARKER_END   = '# agents-library [end]';

  const GITIGNORE_BLOCK = `${GITIGNORE_MARKER_START}
# Claude Code sub-agents
.claude/agents/

# GitHub Copilot instructions
.github/copilot-instructions.md
.github/instructions/

# Amazon Q Developer
.amazonq/

# OpenAI Codex CLI
.codex/

# Aider
CONVENTIONS.md
.aider.conf.yml
${GITIGNORE_MARKER_END}`;

  function updateGitignore() {
    const gitignorePath = path.join(TARGET, '.gitignore');

    if (DRY_RUN) {
      log('✓', GREEN, `.gitignore  ${DIM}(would add agents-library block)${RESET}`);
      return;
    }

    const current = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';

    if (current.includes(GITIGNORE_MARKER_START)) {
      log('–', DIM, `.gitignore  ${DIM}(block already present)${RESET}`);
      return;
    }

    const separator = current.length > 0 && !current.endsWith('\n') ? '\n' : '';
    fs.writeFileSync(gitignorePath, current + separator + '\n' + GITIGNORE_BLOCK + '\n', 'utf8');
    log('✓', GREEN, `.gitignore`);
  }

  // ── Manifest ──────────────────────────────────────────────────────────────

  function readManifest() {
    const p = path.join(TARGET, MANIFEST_FILE);
    if (!fs.existsSync(p)) return { version: null, files: {} };
    try   { return JSON.parse(fs.readFileSync(p, 'utf8')); }
    catch { return { version: null, files: {} }; }
  }

  function writeManifest(version, fileHashes) {
    if (DRY_RUN) return;
    fs.writeFileSync(
      path.join(TARGET, MANIFEST_FILE),
      JSON.stringify({ version, updatedAt: new Date().toISOString(), files: fileHashes }, null, 2) + '\n',
      'utf8',
    );
  }

  // ── Conflict prompt ───────────────────────────────────────────────────────

  async function askConflict(relPath, { showAppend = true } = {}) {
    if (!rl) {
      rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    }

    const opts = showAppend
      ? '[o] overwrite  [a] append  [b] backup+install  [s] skip'
      : '[o] overwrite  [b] backup+install  [s] skip';

    return new Promise(resolve => {
      console.log();
      console.log(`  ${YELLOW}!${RESET} ${BOLD}${relPath}${RESET} ${DIM}has local modifications${RESET}`);
      process.stdout.write(`    ${opts}   choice [s]: `);
      rl.once('line', answer => {
        const choice = answer.trim().toLowerCase();
        const valid  = showAppend ? ['o', 'a', 'b', 's'] : ['o', 'b', 's'];
        resolve(valid.includes(choice) ? choice : 's');
      });
    });
  }

  async function applyChoice(choice, src, dest) {
    ensureDir(path.dirname(dest));
    switch (choice) {
      case 'o':
        fs.copyFileSync(src, dest);
        return 'overwritten';
      case 'a':
        fs.appendFileSync(dest, '\n' + fs.readFileSync(src, 'utf8'));
        return 'appended';
      case 'b':
        fs.copyFileSync(dest, dest + '.bak');
        fs.copyFileSync(src, dest);
        return 'backed-up';
      default:
        return 'skipped';
    }
  }

  // ── copyFile — install mode ───────────────────────────────────────────────
  //
  // Returns: 'copied' | 'up-to-date' | 'overwritten' | 'appended' |
  //          'backed-up' | 'skipped' | 'missing' |
  //          'would-copy' | 'would-conflict' | 'would-overwrite' (dry-run)

  async function copyFile(src, dest) {
    if (!fs.existsSync(src)) return 'missing';

    const srcHash  = hashFile(src);
    const destHash = hashFile(dest);
    const exists   = destHash !== null;
    const modified = exists && srcHash !== destHash;

    if (DRY_RUN) {
      if (!exists)  return 'would-copy';
      if (modified) return 'would-conflict';
      return 'would-overwrite';
    }

    if (!exists) {
      ensureDir(path.dirname(dest));
      fs.copyFileSync(src, dest);
      return 'copied';
    }

    if (!modified) return 'up-to-date';

    if (FORCE) {
      ensureDir(path.dirname(dest));
      fs.copyFileSync(src, dest);
      return 'overwritten';
    }

    if (!IS_INTERACTIVE) return 'skipped';

    return applyChoice(await askConflict(path.relative(TARGET, dest)), src, dest);
  }

  // ── updateFile — update mode (manifest-aware) ─────────────────────────────
  //
  // manifestHash: hash recorded at last install/update (null = file is new in package)
  //
  // Returns: 'copied' | 'updated' | 'up-to-date' | 'overwritten' | 'appended' |
  //          'backed-up' | 'skipped' | 'missing' |
  //          'would-copy' | 'would-update' | 'would-conflict' | 'up-to-date' (dry-run)

  async function updateFile(src, dest, manifestHash) {
    if (!fs.existsSync(src)) return 'missing';

    const srcHash  = hashFile(src);
    const destHash = hashFile(dest);

    if (DRY_RUN) {
      if (!destHash)                             return 'would-copy';
      if (srcHash === destHash)                  return 'up-to-date';
      if (manifestHash && manifestHash === destHash) return 'would-update';
      if (!manifestHash)                         return 'would-copy';   // new file
      return 'would-conflict';
    }

    // dest missing → install
    if (!destHash) {
      ensureDir(path.dirname(dest));
      fs.copyFileSync(src, dest);
      return 'copied';
    }

    // already at latest
    if (srcHash === destHash) return 'up-to-date';

    // new file in package (no manifest entry) → install automatically
    if (!manifestHash) {
      ensureDir(path.dirname(dest));
      fs.copyFileSync(src, dest);
      return 'copied';
    }

    // user hasn't touched it since last install → safe auto-update
    if (manifestHash === destHash) {
      fs.copyFileSync(src, dest);
      return 'updated';
    }

    // user modified → prompt
    if (FORCE) {
      fs.copyFileSync(src, dest);
      return 'overwritten';
    }

    if (!IS_INTERACTIVE) return 'skipped';

    return applyChoice(await askConflict(path.relative(TARGET, dest)), src, dest);
  }

  function closeReadline() { if (rl) rl.close(); }

  return {
    log, ensureDir, hashFile, getMdFiles,
    buildInstallMap,
    updateGitignore,
    readManifest, writeManifest,
    copyFile, updateFile,
    IS_INTERACTIVE, closeReadline,
    GITIGNORE_MARKER_START, GITIGNORE_MARKER_END,
  };
}

module.exports = {
  createContext, MANIFEST_FILE,
  RESET, GREEN, YELLOW, RED, CYAN, BOLD, DIM,
};
