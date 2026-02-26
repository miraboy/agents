# Agents Library

> Un framework multi-agents prêt à l'emploi — **30 agents spécialisés**, deux équipes coordonnées, un point d'entrée unique.
> Compatible Claude Code, GitHub Copilot, Amazon Q, Aider et OpenAI Codex.

---

## Vue d'ensemble

```
                        👑 super-chef
                    (point d'entrée unique)
                           │
              ┌────────────┼────────────┐
              │            │            │
        🎯 chef-equipe  ⚖️ pivot   🎬 directeur-creatif
        Équipe Dev      Dev↔Comm   Équipe Comm
```

**Le super-chef** reçoit toutes les demandes — dev, comm, produit ou mixtes — et route intelligemment vers les bons spécialistes. Tu n'as jamais à choisir qui appeler.

---

## Les équipes

### 🛠️ Équipe Dev — 15 agents

| Agent | Rôle |
|-------|------|
| 🎯 `chef-equipe` | Lead Dev / CTO — interlocuteur principal, pilote l'équipe |
| 🔀 `orchestrateur` | Décompose les projets complexes, coordonne les flux |
| 🏗️ `architecte` | Conception système, choix de stack, ADRs |
| ⚡ `backend-dev` | APIs, BDD, logique métier — Bun, Hono, tRPC, Drizzle |
| 🎨 `frontend-dev` | UI web — React 19, Next.js 15, TanStack, shadcn/ui |
| 📱 `mobile-dev` | iOS/Android — React Native, Expo SDK 52+, Flutter |
| 🚀 `devops` | CI/CD, Docker, infrastructure as code |
| 🧪 `qa-testeur` | Tests unitaires, intégration, E2E |
| 🔒 `securite` | Audit OWASP, vulnérabilités, bonnes pratiques |
| 📝 `tech-writer` | READMEs, docs API, guides utilisateur |
| 📊 `data-analyst` | Métriques produit, SQL, dashboards, KPIs |
| 🔍 `ux-researcher` | Tests utilisateurs, heuristiques, parcours UX |
| 🧠 `prompt-engineer` | Ingénierie de prompts, agents LLM, architectures IA |
| 🤖 `ai-integrator` | Intégration APIs IA, pipelines RAG, streaming |
| 📡 `veille-technologie` | Benchmark de stacks, recommandations, alertes migration |

### 📣 Équipe Comm — 11 agents

| Agent | Rôle |
|-------|------|
| 🎬 `directeur-creatif` | Lead créatif — vision de marque, coordination comm |
| 🔀 `orchestrateur-comm` | Coordonne les projets comm complexes |
| 🗺️ `stratege-comm` | Plans de communication 360°, positionnement, KPIs |
| 💡 `product-thinker` | User stories, roadmap, pont dev ↔ comm |
| 💎 `brand-strategist` | Identité de marque, messaging, tone of voice |
| ✍️ `redacteur-web` | Copywriting, landing pages, articles SEO |
| 📱 `social-media-manager` | Réseaux sociaux, calendriers éditoriaux |
| 📧 `email-marketer` | Séquences email, newsletters, automation |
| 📈 `growth-hacker` | Acquisition, conversion, funnels, A/B tests |
| 📣 `ads-manager` | Meta Ads, Google Ads, TikTok Ads, LinkedIn Ads |
| 🔎 `seo-specialist` | SEO technique et éditorial, Core Web Vitals |

### ⚖️ Pivot Dev ↔ Comm — 1 agent

| Agent | Rôle |
|-------|------|
| ⚖️ `legal-advisor` | CGU, RGPD/CCPA, mentions légales, licences open-source |

### 🧬 Agents méta — 2 agents

| Agent | Rôle |
|-------|------|
| 🧬 `agent-maker` | Crée un nouvel agent si une compétence manque à l'équipe |
| 🧠 `context-manager` | Mémoire du projet, CLAUDE.md, handoffs inter-sessions |

---

## Installation

```bash
npx github:miraboy/agents
```

Le script installe les agents dans **tous les outils supportés** en une seule commande, crée les dossiers manquants et ajoute automatiquement un bloc dans `.gitignore` pour garder ces configs locales.

### Ce qui est installé

| Outil | Destination | Contenu |
|-------|-------------|---------|
| **Claude Code** | `.claude/agents/` | super-chef + 29 agents |
| **GitHub Copilot** | `.github/` | `copilot-instructions.md` + instructions par équipe |
| **Amazon Q** | `.amazonq/rules/` | `dev-team.md` + `comm-team.md` |
| **OpenAI Codex** | `AGENTS.md` + `.codex/config.toml` | Rôles, profils, standards |
| **Aider** | `CONVENTIONS.md` + `.aider.conf.yml` | Conventions et config |

### Commandes disponibles

```bash
npx github:miraboy/agents                    # installe tout
npx github:miraboy/agents --force            # écrase les fichiers existants
npx github:miraboy/agents --dry-run          # prévisualise sans écrire
npx github:miraboy/agents --target <dir>     # installe dans un dossier spécifique

agents-uninstall                             # supprime tout + nettoie .gitignore
agents-uninstall --dry-run                   # prévisualise sans supprimer
```

> Les fichiers installés sont ajoutés au `.gitignore` du projet — ils restent locaux à chaque développeur.

---

## Structure du dépôt

```
agents-library/
├── super-chef.md              👑 Point d'entrée unique
├── agents.json                📋 Source de vérité (tous les agents)
│
├── agent-dev/                 🛠️  Équipe développement (15 agents)
├── agent-com/                 📣 Équipe communication & growth (12 agents)
│
├── adapters/                  🔌 Adapters pour les autres outils AI
│   ├── github-copilot/
│   ├── amazon-q/
│   ├── aider/
│   └── codex/
│
├── templates/                 📄 Template CLAUDE.md pour le context-manager
├── examples/                  💡 Scénarios d'utilisation multi-agents
└── bin/                       ⚙️  Scripts d'installation / mise à jour / désinstallation
```

---

## Utilisation

### Claude Code

Invoque `@super-chef` pour n'importe quelle demande — il route vers le bon agent.

```
@super-chef je veux créer une API de gestion d'utilisateurs avec auth JWT
@super-chef prépare une stratégie de lancement pour mon app
@super-chef j'ai besoin d'intégrer l'API Anthropic dans mon app Next.js
@super-chef audite les CGU de mon SaaS pour la conformité RGPD
```

Ou invoque un agent directement si tu sais déjà ce dont tu as besoin :

```
@backend-dev crée un endpoint POST /auth/login avec Hono + Drizzle
@prompt-engineer optimise ce system prompt pour réduire les hallucinations
@legal-advisor génère une politique de confidentialité RGPD pour mon SaaS
@veille-technologie compare tRPC vs REST vs GraphQL pour mon projet
```

### OpenAI Codex (CLI + VSCode)

`AGENTS.md` est lu automatiquement à la racine du projet. Utilise `@super-chef` ou l'un des rôles directement.

```bash
codex "analyse l'architecture actuelle et propose des améliorations"
codex --profile super-chef "..."   # o3 high reasoning
codex --profile dev "..."          # o4-mini medium
```

---

## Mode de validation

Au démarrage d'un projet, le super-chef propose trois modes :

| Mode | Comportement |
|------|-------------|
| **1 — Contrôle total** | Chaque agent attend ton "ok" avant de continuer |
| **2 — Tout automatique** | Les agents enchaînent, tu reçois la synthèse finale |
| **3 — Étapes clés** | Seuls les chefs et orchestrateurs demandent validation |

---

## Ressources

- **Dashboards interactifs** : `agent-dev/dashboard.html` · `agent-com/dashboard-comm.html`
- **Exemples de scénarios** : `examples/landing-page-launch.md` · `examples/bug-fix-critical.md` · `examples/campagne-sociale.md`
- **Template CLAUDE.md** : `templates/CLAUDE.md.template`
- **Adapters détaillés** : `adapters/README.md`
