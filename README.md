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

**Installation globale** — rend les commandes disponibles partout :

```bash
npm install -g github:miraboy/agents
```

Puis depuis chaque projet où vous voulez installer les agents :

```bash
cd mon-projet
agents-install
```

**Ou via npx** — sans installation permanente :

```bash
npx github:miraboy/agents
```

Le script copie tous les fichiers agents dans les destinations appropriées, crée les dossiers manquants et ajoute un bloc dans `.gitignore` pour que les configs restent locales.

### Prérequis — permissions npm (Linux / macOS)

Si l'install globale échoue avec une erreur de permissions (`EACCES`), configurez npm pour utiliser un dossier dans votre home :

**Bash (`~/.bashrc`) :**
```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Zsh (`~/.zshrc`) :**
```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

> Si vous utilisez **nvm**, ce problème ne se pose pas — nvm gère déjà les permissions globales sans `sudo`.

### Commandes disponibles

```bash
agents-install              # installe tout (équipes dev + comm + super-chef + adapters)
agents-install --force      # écrase les fichiers existants
agents-install --dry-run    # prévisualise sans écrire
agents-install --target <dir>  # installe dans un dossier spécifique

agents-uninstall            # supprime tous les fichiers installés + nettoie .gitignore
agents-uninstall --dry-run  # prévisualise sans supprimer
```

### Ce qui est installé

| Destination | Contenu |
|---|---|
| `.claude/agents/` | `super-chef.md` + tous les agents dev & comm |
| `.github/copilot-instructions.md` | Instructions GitHub Copilot |
| `.github/instructions/` | Instructions Copilot par équipe |
| `.amazonq/rules/` | Règles Amazon Q Developer |
| `.codex/` | System prompts OpenAI Codex CLI |
| `CONVENTIONS.md` + `.aider.conf.yml` | Config Aider |

> Les dossiers sont créés automatiquement s'ils n'existent pas.
> Un bloc `# agents-library [start/end]` est ajouté dans `.gitignore` pour que ces fichiers restent locaux à chaque développeur.

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

Le dossier `adapters/` contient des prompts prêts à l'emploi pour utiliser l'expertise des équipes dans d'autres assistants AI. Ils sont installés automatiquement par `agents-install`.

| Outil | Destination | Fichiers |
|-------|-------------|---------|
| **GitHub Copilot** | `.github/` | `copilot-instructions.md` + 2 instructions par équipe |
| **Amazon Q Developer** | `.amazonq/rules/` | `dev-team.md` + `comm-team.md` |
| **Aider** | `./` | `CONVENTIONS.md` + `.aider.conf.yml` |
| **Codex CLI** | `.codex/` | `system-prompt-dev/comm/full.txt` |

Voir `adapters/README.md` pour les instructions détaillées par outil.

### Régénérer les adapters

Après toute modification d'`agents.json` :

```bash
./scripts/generate-adapters.sh
```

Requiert `jq` (`apt install jq` / `brew install jq`).
