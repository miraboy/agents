# Agents Library

Ce dépôt contient deux équipes de sous-agents prêtes à copier dans `.claude/agents`, plus un super-chef qui coordonne les deux. Des **adapters** permettent également d'utiliser la même expertise dans GitHub Copilot, Amazon Q Developer, Aider et Codex CLI.

## Structure

```
super-chef.md              ← Point d'entrée unique (route vers dev ou comm)
agents.json                ← Source de vérité centralisée (tous les agents)
agent-dev/                 ← Équipe développement (11 agents)
agent-com/                 ← Équipe communication & growth (11 agents)
adapters/                  ← Prompts pour GitHub Copilot, Amazon Q, Aider, Codex CLI
templates/                 ← Template CLAUDE.md pour le context-manager
examples/                  ← Scénarios d'utilisation multi-agents
scripts/                   ← Outils de maintenance (génération dashboards + adapters)
```

## Dossiers

- `agent-dev/` : équipe développement (architecture, frontend, backend, QA, sécurité, data, UX, etc.)
- `agent-com/` : équipe communication/growth (stratégie, branding, contenu, SEO, acquisition, etc.)
- `adapters/` : fichiers de prompts adaptés pour GitHub Copilot, Amazon Q, Aider, Codex CLI
- `templates/` : template CLAUDE.md structuré pour le context-manager
- `examples/` : 3 scénarios concrets montrant l'orchestration multi-agents
- `scripts/` : scripts de régénération des dashboards et des adapters depuis `agents.json`

## Installation

### Installer l'équipe dev

```bash
mkdir -p .claude/agents
cp agent-dev/*.md .claude/agents/
```

### Installer l'équipe comm

```bash
mkdir -p .claude/agents
cp agent-com/*.md .claude/agents/
```

### Installer les deux équipes + super-chef

```bash
mkdir -p .claude/agents
cp agent-dev/*.md agent-com/*.md super-chef.md .claude/agents/
```

## agents.json

Fichier centralisé contenant les métadonnées de tous les agents (id, modèle, outils, escalation targets, etc.). C'est la source unique de vérité utilisée par le script de génération des dashboards.

## Dashboards

- `agent-dev/dashboard.html` — visualisation interactive de l'équipe dev
- `agent-com/dashboard-comm.html` — visualisation interactive de l'équipe comm

### Régénérer les dashboards

Les dashboards sont générés depuis `agents.json`. Après toute modification d'agent :

```bash
./scripts/generate-dashboards.sh
```

Requiert `jq` (`apt install jq` / `brew install jq`).

## Exemples de scénarios

- `examples/landing-page-launch.md` — projet mixte dev + comm
- `examples/bug-fix-critical.md` — urgence dev uniquement
- `examples/campagne-sociale.md` — campagne comm uniquement

## Template CLAUDE.md

Le fichier `templates/CLAUDE.md.template` fournit un squelette structuré pour le context-manager. Il couvre : vue d'ensemble, stack, architecture, état actuel, décisions, dette technique, prochaines étapes.

## Adapters — autres outils AI

Le dossier `adapters/` contient des prompts prêts à l'emploi pour utiliser l'expertise des équipes dans d'autres assistants AI :

| Outil | Fichiers | Installation |
|-------|---------|-------------|
| **GitHub Copilot** | `copilot-instructions.md` + 2 fichiers path-specific | Copier dans `.github/` |
| **Amazon Q Developer** | `dev-team.md` + `comm-team.md` (avec IDs) | Copier dans `.amazonq/rules/` |
| **Aider** | `CONVENTIONS.md` + `.aider.conf.yml` | Copier à la racine du projet |
| **Codex CLI** | `system-prompt-dev/comm/full.txt` | `codex -s "$(cat ...)"` |

Voir `adapters/README.md` pour les instructions détaillées.

### Régénérer les adapters

Après toute modification d'`agents.json` :

```bash
./scripts/generate-adapters.sh
```

Requiert `jq` (`apt install jq` / `brew install jq`).
