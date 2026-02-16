# Agents Library

Ce dépôt contient deux équipes de sous-agents prêtes à copier dans `.claude/agents`, plus un super-chef qui coordonne les deux.

## Structure

```
super-chef.md              ← Point d'entrée unique (route vers dev ou comm)
agents.json                ← Source de vérité centralisée (tous les agents)
agent-dev/                 ← Équipe développement (13 agents)
agent-com/                 ← Équipe communication & growth (11 agents)
templates/                 ← Template CLAUDE.md pour le context-manager
examples/                  ← Scénarios d'utilisation multi-agents
scripts/                   ← Outils de maintenance (génération dashboards)
```

## Dossiers

- `agent-dev/` : équipe développement (architecture, frontend, backend, QA, sécurité, data, UX, etc.)
- `agent-com/` : équipe communication/growth (stratégie, branding, contenu, SEO, acquisition, etc.)
- `templates/` : template CLAUDE.md structuré pour le context-manager
- `examples/` : 3 scénarios concrets montrant l'orchestration multi-agents
- `scripts/` : script de régénération des dashboards depuis `agents.json`

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
