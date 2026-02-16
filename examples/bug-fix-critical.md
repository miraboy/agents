# Scénario : Correction de Bug Critique en Production

> Projet dev uniquement — urgence haute — durée estimée : 2-6 heures

## Contexte

Une faille d'authentification permet à des utilisateurs non-authentifiés d'accéder à des données privées.
Découverte à 14h un mardi. La production doit être corrigée avant 18h.

## Flux d'orchestration

### Phase 1 — Diagnostic immédiat (15 min)

**chef-equipe** → brief orchestrateur en mode urgence

1. `securite` — audit immédiat de la surface d'attaque :
   - Confirmation de la vulnérabilité (type OWASP)
   - Scope des données exposées
   - Vecteurs d'attaque possibles
   - Recommandation : patch immédiat ou rollback

### Phase 2 — Correction (30-90 min, parallèle si possible)

2. `backend-dev` — implémente le patch selon les specs de securite :
   - Correction du middleware d'authentification
   - Tests de non-régression sur les endpoints concernés

3. `devops` — prépare le déploiement d'urgence :
   - Pipeline de déploiement express
   - Plan de rollback en cas d'échec

### Phase 3 — Validation et déploiement (30 min)

4. `qa-testeur` — validation ciblée :
   - Tests des scénarios d'attaque identifiés par securite
   - Vérification que le fix ne casse pas les flows d'auth normaux

5. `securite` — re-audit post-patch :
   - Confirmation que la vulnérabilité est corrigée
   - Vérification qu'aucun vecteur secondaire n'a été ouvert

6. `devops` — déploiement en production + monitoring renforcé (30 min post-deploy)

### Phase 4 — Documentation (post-correction)

7. `tech-writer` — rédige le post-mortem :
   - Chronologie de l'incident
   - Root cause analysis
   - Mesures prises
   - Actions préventives pour éviter la récurrence

## Handoffs clés

```
securite → backend-dev :
  Rapport de vulnérabilité avec localisation exacte (fichier:ligne)
  + correction recommandée + code corrigé si possible

securite → devops :
  Mesures de mitigation immédiates (rate limiting, IP block si nécessaire)

backend-dev → qa-testeur :
  Code corrigé + scénarios de test spécifiques à valider

qa-testeur → devops :
  Feu vert pour déploiement (tests passent)
  OU blocage avec liste des tests en échec
```

## Protocole d'escalade pour cet incident

```
Si securite confirme Critical (données personnelles exposées) :
→ chef-equipe informe immédiatement l'utilisateur/client
→ Évaluer obligation de notification RGPD (délai 72h)

Si le patch backend nécessite une refonte d'architecture :
→ architecte impliqué pour un fix temporaire + plan long terme
→ chef-equipe ajuste la timeline avec l'utilisateur

Si le déploiement échoue :
→ devops exécute le rollback immédiatement
→ backend-dev revoit le patch
→ Nouveau cycle de test/déploiement
```

## Critères de résolution

- [ ] Vulnérabilité confirmée corrigée par securite
- [ ] Aucune régression sur les tests QA
- [ ] Déploiement réussi (rollback non déclenché)
- [ ] Post-mortem rédigé et partagé
- [ ] Monitoring renforcé actif 24h post-déploiement
- [ ] Actions préventives planifiées dans le backlog
