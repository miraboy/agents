# Adapters — Prompts for AI Coding Assistants

This folder contains prompt files adapted from the Agents Library for use with
GitHub Copilot, Amazon Q Developer, Aider, and OpenAI Codex CLI.

The source of truth is always `../agents.json`. Run `../scripts/generate-adapters.sh`
to update agent lists in all adapter files after any change to agents.json.

---

## GitHub Copilot

**Files:**
```
github-copilot/
├── copilot-instructions.md        ← global instructions (always applied)
└── instructions/
    ├── dev-team.instructions.md   ← applied to src/**, *.ts, *.py, etc.
    └── comm-team.instructions.md  ← applied to content/**, docs/**, *.md
```

**Install:**
```bash
mkdir -p .github/instructions
cp github-copilot/copilot-instructions.md .github/
cp github-copilot/instructions/*.instructions.md .github/instructions/
```

The `applyTo` frontmatter in each `.instructions.md` file tells Copilot when to
activate that rule set. Edit the glob patterns to match your project layout.

**Requires:** VS Code with GitHub Copilot extension, Copilot Chat enabled.

---

## Amazon Q Developer

**Files:**
```
amazon-q/
└── rules/
    ├── dev-team.md    ← ID: DEV_TEAM_RULES
    └── comm-team.md   ← ID: COMM_TEAM_RULES
```

**Install:**
```bash
mkdir -p .amazonq/rules
cp amazon-q/rules/*.md .amazonq/rules/
```

Each file begins with a unique `ID:` for traceability. Amazon Q picks up all
Markdown files in `.amazonq/rules/` automatically.

---

## Aider

**Files:**
```
aider/
├── CONVENTIONS.md     ← read-only context file (cached)
└── .aider.conf.yml    ← aider configuration
```

**Install:**
```bash
cp aider/CONVENTIONS.md .
cp aider/.aider.conf.yml .
```

Edit `.aider.conf.yml` to set your preferred model:
```yaml
model: gpt-4o          # or: claude-sonnet-4-6, o3, gemini/gemini-2.0-flash-exp
```

**Usage:**
```bash
aider                              # picks up .aider.conf.yml automatically
aider --read CONVENTIONS.md        # explicit read if no config file
```

CONVENTIONS.md is loaded as a read-only cached file — it guides Aider without
being editable by it. Update it manually when project conventions change.

---

## OpenAI Codex CLI

**Files:**
```
codex/
├── system-prompt-dev.txt    ← dev team expertise + conventions
├── system-prompt-comm.txt   ← comm team expertise + frameworks
└── system-prompt-full.txt   ← super-chef mode (dev + comm + routing)
```

**Usage:**
```bash
# Dev session
codex -s "$(cat path/to/system-prompt-dev.txt)" "your request here"

# Comm session
codex -s "$(cat path/to/system-prompt-comm.txt)" "your request here"

# Full super-chef mode (routes between dev and comm)
codex -s "$(cat path/to/system-prompt-full.txt)" "your request here"
```

Or set as a shell alias in your `.zshrc` / `.bashrc`:
```bash
alias adev='codex -s "$(cat ~/agents/adapters/codex/system-prompt-dev.txt)"'
alias acomm='codex -s "$(cat ~/agents/adapters/codex/system-prompt-comm.txt)"'
alias achef='codex -s "$(cat ~/agents/adapters/codex/system-prompt-full.txt)"'
```

---

## Updating Agent Data

When you add or modify agents in `agents.json`, regenerate the agent lists
embedded in the adapter files:

```bash
../scripts/generate-adapters.sh
```

This script injects updated agent tables between `ADAPTERS_DATA_START` /
`ADAPTERS_DATA_END` markers without overwriting the rest of the content.

---

## Comparison: Claude Agents vs Adapters

| Feature | Claude Agents (`.claude/agents/`) | Adapters |
|---------|----------------------------------|---------|
| Tool execution | Yes (Read, Write, Edit, Bash…) | No — prompt guidance only |
| Multi-agent orchestration | Yes (Task tool) | No — single context |
| Model selection per agent | Yes (Opus / Sonnet / Haiku) | Depends on tool |
| Path-specific activation | N/A | Yes (Copilot, Cline) |
| Works without Claude | No | Yes |
