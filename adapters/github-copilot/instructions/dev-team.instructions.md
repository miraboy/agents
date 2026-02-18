---
applyTo: "src/**,api/**,lib/**,server/**,backend/**,*.ts,*.tsx,*.js,*.mjs,*.py,*.go,*.rs,*.java"
---

# Dev Team Conventions

Apply the following standards to all development code in this project.

---

## Language & Typing

- **TypeScript always** over plain JavaScript — strict mode, no `any` without justification
- Zod (Node.js) or Pydantic (Python) for all input validation at system boundaries
- Explicit return types on all exported functions
- JSDoc on all exported components and public APIs

---

## Backend

- Frameworks: Express, Fastify, NestJS (Node.js) | FastAPI, Django REST (Python)
- Always document APIs with OpenAPI / Swagger annotations
- No hardcoded secrets — use environment variables, never commit `.env`
- Use structured logging (no `console.log` in production code)
- Explicit error handling — no silent `try/catch` that swallows errors
- Input validation on every endpoint before business logic executes
- Authentication: JWT (validate signature + expiry), OAuth2, Passport.js
- Database: PostgreSQL with Prisma or Drizzle ORM preferred

**Mandatory per API endpoint:**
1. Input schema (Zod/Pydantic)
2. Error handling with typed errors
3. OpenAPI annotation
4. At least one unit test on business logic

---

## Frontend

- React 18+ with hooks, Zustand or React Query for state/data
- Next.js 14+ App Router for full-stack projects
- Tailwind CSS preferred; CSS Modules acceptable
- **WCAG 2.1 AA** accessibility minimum — semantic HTML, aria labels, keyboard navigation
- Performance: lazy loading, code splitting, image optimisation (`next/image` or equivalent)
- Responsive design is non-negotiable — mobile-first
- Components must be self-contained, typed, and documented

**Component checklist:**
- [ ] TypeScript props interface
- [ ] Error boundary or error state handled
- [ ] Accessible (role, aria, keyboard)
- [ ] Responsive
- [ ] JSDoc description

---

## Architecture

- Always propose **2–3 options with explicit trade-offs** for structural decisions
- Document decisions as **Architecture Decision Records (ADR)**:
  ```
  ## ADR-NNN: [Title]
  Status: Proposed | Accepted | Deprecated
  Context: [Why this decision is needed]
  Decision: [What was decided]
  Consequences: [Trade-offs, risks, benefits]
  ```
- Patterns to consider: Microservices, Monolith, Event-driven, CQRS, DDD
- Prioritise **maintainability + performance** over cleverness
- Design for real needs — no speculative abstractions

---

## Security (OWASP Top 10)

Apply the following on every feature that handles user data, auth, or external input:

| Risk | Mitigation |
|------|-----------|
| Injection | Parameterised queries, ORMs, never raw string SQL |
| Broken Auth | JWT validation (signature + expiry), short-lived tokens, refresh rotation |
| XSS | Sanitise output, CSP headers, no `dangerouslySetInnerHTML` |
| IDOR | Server-side ownership check on every resource access |
| Sensitive Data | HTTPS everywhere, bcrypt/Argon2 for passwords, no PII in logs |
| CSRF | SameSite cookies, CSRF tokens for state-changing forms |
| Security Misconfiguration | HTTP security headers (CSP, HSTS, X-Frame-Options) |

Severity classification when reporting issues:
**Critical → High → Medium → Low → Info**
Always provide corrected code alongside any vulnerability report.

---

## Testing

- Unit tests on all business logic (Vitest / Jest / pytest)
- Integration tests for API endpoints
- E2E tests for critical user flows (Playwright)
- Minimum target: business logic coverage > 80%
- QA checklist before each release:
  - [ ] No regressions on existing tests
  - [ ] New feature has tests
  - [ ] Security checklist reviewed
  - [ ] Performance benchmarked if relevant

---

## DevOps & Infrastructure

- Dockerise all services with multi-stage builds (dev + prod)
- CI/CD: lint → test → build → deploy pipeline
- Infrastructure as Code for any cloud resources
- No manual production deployments without peer review
- Secrets management: use vault, env injection, never in source code

---

## Output Quality Standard

Every code deliverable must include:
1. **Complete, functional code** — never truncate or use placeholders
2. **Error handling** — all failure paths covered
3. **Inline comments** on non-obvious logic only
4. **Usage example** (curl, code snippet, or test) when delivering an API or utility
5. **Environment variables** listed if the code introduces new ones
