# Project Conventions

This file is read by Aider as a read-only reference. It defines the coding standards,
architecture principles, and quality requirements for this project.

---

## Stack Defaults

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (strict mode) |
| Frontend | React 18+, Next.js 14+ App Router, Tailwind CSS |
| Backend | Node.js with Express / Fastify / NestJS |
| Database | PostgreSQL with Prisma or Drizzle ORM |
| Validation | Zod (runtime), TypeScript (compile-time) |
| Auth | JWT + OAuth2, bcrypt/Argon2 for passwords |
| Cache | Redis |
| Testing | Vitest + React Testing Library + Playwright |
| CI/CD | Docker multi-stage + automated pipeline |

Python alternative: FastAPI + Pydantic + SQLAlchemy + pytest

---

## Mandatory Coding Rules

### Types
- TypeScript strict mode — no `any` without an explicit justification comment
- Zod or Pydantic schema for every input at system boundaries (API endpoints, form handlers)
- Explicit return types on all exported functions

### Backend
- No hardcoded secrets — environment variables only, never committed
- Structured logging (Winston / Pino / structlog) — no `console.log` in production
- Explicit error handling — no silent catch blocks that swallow errors
- Input validation runs before any business logic
- Every new API endpoint needs: input schema + error handling + OpenAPI annotation + unit test

### Frontend
- Components: TypeScript props interface required
- Accessibility: WCAG 2.1 AA — semantic HTML, aria labels, keyboard navigation
- Performance: lazy loading, code splitting at route level, `next/image` for media
- Responsive: mobile-first, all breakpoints tested
- No `dangerouslySetInnerHTML` without explicit sanitisation

### Database
- All schema changes as migration files — no direct ALTER in production
- Parameterised queries only — never string-concatenated SQL
- Index strategy documented for tables > 100k rows

---

## Architecture Principles

- Design for current requirements — no speculative abstractions
- When multiple approaches exist, document trade-offs before deciding
- Record architecture decisions as ADRs:
  ```
  ## ADR-NNN: [Title]
  Status: Proposed | Accepted | Deprecated
  Context: [Why this decision is needed]
  Decision: [What was decided]
  Consequences: [Trade-offs and risks]
  ```
- Complexity hierarchy: monolith first, services when team/scale demands it
- Prioritise: correctness > maintainability > performance

---

## Security — OWASP Top 10

| Threat | Mitigation |
|--------|-----------|
| Injection | Parameterised queries, ORMs, never raw SQL strings |
| Broken Auth | JWT (verify signature + expiry + audience), refresh rotation |
| XSS | Output sanitisation, CSP headers, no unsafe innerHTML |
| IDOR | Server-side ownership check on every resource access |
| Sensitive Data | HTTPS, bcrypt/Argon2, no PII in logs or error messages |
| Security Misconfiguration | CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| CSRF | SameSite cookies, CSRF tokens for state-changing forms |

Report format for found vulnerabilities:
```
Name: [vulnerability name]
Severity: Critical | High | Medium | Low | Info
OWASP: [category]
Location: [file:line]
Impact: [what an attacker can do]
Fix: [corrected code]
```

---

## Testing Standards

- Business logic: unit tests required, target > 80% coverage
- API routes: integration tests with real HTTP calls
- Critical flows: E2E tests (Playwright)
- Tests must run in CI — no skipped tests without a dated TODO comment

---

## Content & SEO (if applicable)

- One H1 per page
- Meta description: 150–160 characters, includes primary keyword
- Internal linking: minimum 2 links per new content page
- No duplicate content without canonical tag
- Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1

---

## Output Quality Standard

Every deliverable must be:
1. **Complete** — no `// TODO: implement this` placeholders in delivered code
2. **Tested** — at minimum a usage example or unit test
3. **Documented** — JSDoc on public APIs, inline comments on non-obvious logic
4. **Secure** — OWASP checklist reviewed before shipping

---

<!-- ADAPTERS_DATA_START -->
## Agent Reference

### Dev Team
- chef-equipe: Lead Dev / CTO — Interlocuteur principal, comprend la vision, clarifie les besoins, pilote l'équipe et tient informé de l'avancement
- orchestrateur: Orchestrateur — Décompose les projets complexes en tâches, assigne les agents, coordonne les flux parallèles et séquentiels
- architecte: Architecture — Conçoit l'architecture des systèmes, choisit les technologies, rédige les ADR et garantit la scalabilité
- frontend-dev: Frontend — Crée les interfaces web et mobile
- backend-dev: Backend — Construit des APIs robustes, modélise les données, implémente la logique métier
- devops: DevOps — Configure les pipelines CI/CD, containerise avec Docker, gère le cloud et le monitoring
- qa-testeur: QA — Écrit tests unitaires, intégration et E2E
- securite: Sécurité — Audite le code, identifie les vulnérabilités OWASP, implémente les bonnes pratiques
- tech-writer: Documentation — Produit READMEs, documentation API, guides utilisateur, changelogs
- data-analyst: Data — Analyse les données, définit les métriques produit, conçoit les dashboards, interprète les KPIs
- ux-researcher: UX Research — Recherche utilisateurs, tests d'utilisabilité, évaluation heuristique, parcours utilisateur

### Comm Team
- directeur-creatif: Lead Créatif — Interlocuteur principal comm
- orchestrateur-comm: Orchestrateur comm — Décompose les projets comm complexes, assigne les agents créatifs, coordonne les livrables et gère les ponts avec l'équipe dev
- stratege-comm: Stratégie — Conçoit les plans de communication 360°, définit le positionnement, choisit les canaux, fixe les objectifs et les KPIs
- product-thinker: Produit — Pont entre vision business et équipe technique
- brand-strategist: Branding — Construit l'ADN de la marque
- redacteur-web: Contenu — Écrit landing pages, articles SEO, fiches produits, pitchs
- social-media-manager: Social Media — Calendriers éditoriaux, posts adaptés par plateforme (LinkedIn, Instagram, X, TikTok, Facebook)
- email-marketer: Email Marketing — Welcome sequences, newsletters, nurturing, paniers abandonnés
- growth-hacker: Growth — Acquisition, activation, rétention, conversion
- ads-manager: Paid Media — Meta Ads, Google Ads, TikTok Ads, LinkedIn Ads
- seo-specialist: SEO — Audite la santé technique des sites, optimise la structure et les contenus pour le référencement naturel
<!-- ADAPTERS_DATA_END -->
