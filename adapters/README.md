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
├── AGENTS.md      ← instructions lues automatiquement par Codex (super-chef + équipes)
└── config.toml    ← définition des 25 rôles agents avec modèles OpenAI
```

**Install:**
```bash
mkdir -p .codex
cp codex/AGENTS.md .codex/
cp codex/config.toml .codex/
```

Codex lit automatiquement `.codex/AGENTS.md` au démarrage de chaque session —
aucune configuration supplémentaire requise.

**Usage des rôles agents (multi-agent) :**
```bash
# Démarrer une session en mode super-chef (par défaut via AGENTS.md)
codex "crée une API REST pour gérer des utilisateurs"

# Utiliser un rôle spécifique
codex --role backend-dev "ajoute un endpoint POST /users"
codex --role redacteur-web "rédige la landing page pour notre SaaS"
codex --role securite "audite ce fichier auth.ts"
```

**Rôles disponibles dans `config.toml` :**

| Rôle | Modèle | Usage |
|------|--------|-------|
| `super-chef` | o3 | Entrée unique, routing, coordination |
| `chef-equipe` | o3 | Lead dev, projets tech multi-tâches |
| `directeur-creatif` | o3 | Lead comm, campagnes multi-canaux |
| `orchestrateur` | o3 | Décomposition et coordination dev |
| `orchestrateur-comm` | o4-mini | Décomposition et coordination comm |
| `architecte` | o4-mini | Architecture système, ADRs |
| `backend-dev` | o4-mini | APIs, BDD, logique serveur |
| `frontend-dev` | o4-mini | UI web, React, Next.js |
| `mobile-dev` | o4-mini | React Native, Expo, Flutter |
| `devops` | o4-mini | CI/CD, Docker, infrastructure |
| `qa-testeur` | o4-mini | Tests automatisés, QA |
| `securite` | o4-mini | Audit OWASP, vulnérabilités |
| `tech-writer` | o4-mini | Documentation, READMEs |
| `data-analyst` | o4-mini | Données, SQL, BI |
| `ux-researcher` | o4-mini | UX, tests utilisateurs |
| `stratege-comm` | o4-mini | Plans de comm, KPIs |
| `product-thinker` | o4-mini | User stories, roadmap |
| `brand-strategist` | o4-mini | Branding, messaging |
| `redacteur-web` | o4-mini | Copywriting, landing pages |
| `social-media-manager` | o4-mini | Réseaux sociaux, calendrier |
| `email-marketer` | o4-mini | Email marketing, automation |
| `growth-hacker` | o4-mini | Acquisition, conversion |
| `ads-manager` | o4-mini | Meta/Google/TikTok Ads |
| `seo-specialist` | o4-mini | SEO technique et éditorial |
| `agent-maker` | o3 | Création de nouveaux agents |
| `context-manager` | o4-mini | Mémoire de session, handoffs |

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
