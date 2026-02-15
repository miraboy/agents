# Agents Library

Ce dépôt contient deux équipes de sous-agents prêtes à copier dans `.claude/agents`.

## Dossiers

- `agent-dev/` : équipe développement (architecture, frontend, backend, QA, sécurité, etc.)
- `agent-com/` : équipe communication/growth (stratégie, branding, contenu, acquisition, etc.)

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

### Installer les deux équipes

```bash
mkdir -p .claude/agents
cp agent-dev/*.md agent-com/*.md .claude/agents/
```

## Dashboards

- `agent-dev/dashboard.html`
- `agent-com/dashboard-comm.html`

Ces dashboards sont des pages statiques pour visualiser les agents, leurs rôles, leurs outils et les commandes d'invocation.
