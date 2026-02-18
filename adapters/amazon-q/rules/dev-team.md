ID: DEV_TEAM_RULES

# Development Team Rules

Apply these conventions to all code suggestions in this project.

---

## Language & Typing

- TypeScript always preferred over plain JavaScript; use strict mode
- Validate all inputs at system boundaries: Zod (Node.js), Pydantic (Python)
- No `any` type without explicit justification in a comment
- Explicit return types on all exported functions and classes
- JSDoc on all public APIs and exported components

---

## Backend Standards

Supported stacks: Express / Fastify / NestJS (Node.js) | FastAPI / Django REST (Python)

### Mandatory per endpoint
- Input validation schema (Zod or Pydantic) before any business logic
- Explicit error handling — no silent catch blocks
- OpenAPI / Swagger annotation
- Unit test for the core business logic

### Always
- Structured logging (Winston, Pino, structlog) — no `console.log` in production
- No hardcoded secrets — use environment variables
- Parameterised queries or ORMs (Prisma, Drizzle, SQLAlchemy) — never raw string SQL
- JWT validation: verify signature, expiry, and audience on every protected route

### Database
- PostgreSQL preferred; Prisma or Drizzle ORM for Node.js, SQLAlchemy for Python
- Every schema change delivered as a migration file, never direct ALTER in production

---

## Frontend Standards

Supported stack: React 18+, Next.js 14+ App Router, TypeScript, Tailwind CSS

### Mandatory per component
- TypeScript props interface — no implicit `any` props
- Error state handled (loading / error / empty states)
- WCAG 2.1 AA accessibility: semantic HTML, aria attributes, keyboard navigation
- Responsive design — mobile-first breakpoints

### Performance
- Lazy loading for non-critical components
- Code splitting at route level
- Image optimisation (`next/image` or equivalent)
- No layout shift — define dimensions on media

---

## Architecture

- Propose 2–3 options with explicit trade-offs for all structural decisions
- Document decisions as Architecture Decision Records (ADR):
  ```
  ## ADR-NNN: [Title]
  Status: Proposed | Accepted | Deprecated
  Context: [Why this decision is needed]
  Decision: [What was decided]
  Consequences: [Trade-offs, risks, benefits]
  ```
- No speculative abstractions — design for current requirements only
- Prioritise: maintainability > performance > cleverness

---

## Security — OWASP Top 10

| Vulnerability | Required mitigation |
|--------------|---------------------|
| SQL Injection | Parameterised queries only |
| Broken Auth | JWT + short-lived tokens + refresh rotation |
| XSS | Sanitised output, CSP headers |
| IDOR | Server-side ownership check per resource |
| Sensitive Data Exposure | HTTPS, bcrypt/Argon2 for passwords, no PII in logs |
| Security Misconfiguration | CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| CSRF | SameSite cookies + CSRF tokens |

Severity scale: **Critical > High > Medium > Low > Info**
Always provide corrected code alongside any vulnerability finding.

---

## Testing

- Unit tests: Vitest / Jest (Node.js), pytest (Python)
- Integration tests: supertest or httpx for API routes
- E2E: Playwright for critical user flows
- Business logic coverage target: > 80%

---

## DevOps

- Dockerise all services with multi-stage builds
- CI pipeline: lint → typecheck → test → build → deploy
- Infrastructure as Code for cloud resources (Terraform, CDK, Pulumi)
- No manual production deployments without a peer-reviewed PR

---

<!-- ADAPTERS_DATA_START -->
## Dev Team Agents

| Agent | Role | Specialty |
|-------|------|-----------|
| chef-equipe | Lead Dev / CTO | Interlocuteur principal, comprend la vision, clarifie les besoins, pilote l'équipe et tient informé de l'avancement |
| orchestrateur | Orchestrateur | Décompose les projets complexes en tâches, assigne les agents, coordonne les flux parallèles et séquentiels |
| architecte | Architecture | Conçoit l'architecture des systèmes, choisit les technologies, rédige les ADR et garantit la scalabilité |
| frontend-dev | Frontend | Crée les interfaces web et mobile |
| backend-dev | Backend | Construit des APIs robustes, modélise les données, implémente la logique métier |
| devops | DevOps | Configure les pipelines CI/CD, containerise avec Docker, gère le cloud et le monitoring |
| qa-testeur | QA | Écrit tests unitaires, intégration et E2E |
| securite | Sécurité | Audite le code, identifie les vulnérabilités OWASP, implémente les bonnes pratiques |
| tech-writer | Documentation | Produit READMEs, documentation API, guides utilisateur, changelogs |
| data-analyst | Data | Analyse les données, définit les métriques produit, conçoit les dashboards, interprète les KPIs |
| ux-researcher | UX Research | Recherche utilisateurs, tests d'utilisabilité, évaluation heuristique, parcours utilisateur |
<!-- ADAPTERS_DATA_END -->
