# Scénario : Lancement d'une Landing Page Produit

> Projet mixte dev + comm — durée estimée : 2-3 jours

## Contexte

Un SaaS B2B veut lancer une landing page pour sa nouvelle feature de reporting automatisé.
Cible : CTOs et heads of product de startups 10-100 personnes.
Objectif : 50 leads qualifiés en 30 jours.

## Flux d'orchestration

### Phase 1 — Stratégie (parallèle)

**super-chef** → brief les deux équipes simultanément

**Équipe Comm (directeur-creatif)**
1. `product-thinker` — définit la proposition de valeur et les personas
2. `brand-strategist` — définit le messaging framework et le ton
3. `stratege-comm` — plan de lancement : canaux, budget, KPIs

**Équipe Dev (chef-equipe)**
1. `architecte` — choix stack landing page (Next.js statique vs Webflow)
2. `backend-dev` — API de capture de lead + intégration CRM

### Phase 2 — Production (séquentielle)

4. `seo-specialist` — brief SEO : mot-clé principal, structure H1/H2, meta-description, Schema.org
5. `redacteur-web` reçoit le messaging framework + brief SEO → écrit la copy complète (hero, bénéfices, social proof, CTA)
6. `frontend-dev` reçoit la copy + les specs techniques → intègre la landing page
7. `qa-testeur` — valide le formulaire, les cas d'erreur, le responsive

### Phase 3 — Distribution

8. `social-media-manager` — 5 posts LinkedIn de lancement (J-7, J-3, J0, J+3, J+7)
9. `email-marketer` — séquence de nurturing pour les leads capturés (3 emails)
10. `ads-manager` — campagne Meta Ads + Google Search (budget recommandé par stratege-comm)
11. `growth-hacker` — plan de CRO post-lancement (A/B tests à lancer à J+14)

## Handoffs clés

```
product-thinker → redacteur-web :
  Personas définis + proposition de valeur + 5 objections principales

brand-strategist → redacteur-web + social-media-manager + ads-manager :
  Messaging framework complet + ton de voix + mots à utiliser/éviter

seo-specialist → redacteur-web + frontend-dev :
  Mot-clé principal, structure H1/H2, méta-description, Schema.org recommandé

redacteur-web → frontend-dev :
  Copy complète en markdown avec annotations de mise en forme

backend-dev → frontend-dev :
  Contrat API du formulaire de capture de lead (endpoint, validation, réponse)
```

## Escalades potentielles

| Situation | Qui escalade | Vers qui |
|-----------|-------------|----------|
| Copy incompatible avec le design technique | frontend-dev | redacteur-web (ajustement) |
| Formulaire qui échoue en test | qa-testeur | backend-dev |
| ROAS insuffisant après 7 jours | ads-manager | growth-hacker (pivot stratégique) |
| Landing page trop lente (Core Web Vitals) | seo-specialist | devops + frontend-dev |

## Métriques de succès

- Conversion visiteur → lead : >5%
- CPC Google Search : <3€
- CTR email welcome : >40%
- Core Web Vitals : tous au vert
- 50 leads qualifiés en 30 jours
