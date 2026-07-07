# YaZoo - Monitoring and alerting

Date: 2026-07-02

## Etat Phase 4A

YaZoo dispose deja d'un collecteur interne pour les erreurs frontend:

- endpoint: `POST /api/monitoring/frontend-error`;
- rate limit: `throttle:10,1`;
- activation frontend: `VITE_MONITORING_ENABLED=false` par defaut;
- stockage: canal Laravel `frontend`, sans SDK externe.

Phase 4A prepare aussi les variables optionnelles suivantes, sans secret reel:

- `SENTRY_DSN=`
- `VITE_SENTRY_DSN=`
- `SENTRY_ENVIRONMENT=production`
- `APPINSIGHTS_CONNECTION_STRING=`

Ces valeurs doivent etre renseignees plus tard via Azure App Settings, GitHub
Secrets ou Key Vault. Elles ne doivent pas etre committees avec de vraies valeurs.

## Logs sans secrets

Le collecteur backend masque les cles sensibles dans les payloads `context` et `user`:
`token`, `access_token`, `authorization`, `secret`, `client_secret`, `password`,
`store_key`, `signature`, `hash`, `card`, `card_number`, `cvv`, `cvc`, `api_key`.
Les query strings des URLs rapportees sont supprimees avant journalisation.

## Alertes a configurer en preproduction

- erreurs backend 500;
- erreurs frontend repetees;
- erreurs paiement et callbacks refuses;
- erreurs upload et tailles excessives;
- erreurs login/OTP anormales;
- disponibilite `/up`, `/health/live`, `/health/ready`;
- saturation CPU/memoire;
- espace disque/logs;
- echec queue/scheduler si actives plus tard.

## Activation future

Option A: Azure Application Insights

1. Creer la ressource Application Insights.
2. Ajouter `APPINSIGHTS_CONNECTION_STRING` dans Azure App Settings.
3. Instrumenter backend/frontend avec SDK officiel seulement apres choix valide.
4. Ajouter alertes Azure Monitor.

Option B: Sentry ou GlitchTip

1. Creer le projet backend et frontend.
2. Ajouter `SENTRY_DSN` et `VITE_SENTRY_DSN` via secrets.
3. Garder l'initialisation conditionnelle: aucun crash si DSN vide.
4. Verifier que les breadcrumbs/payloads ne contiennent aucun secret.

## Limites

Le monitoring externe n'est pas actif en Phase 4A. Cette phase prepare les variables,
la documentation et un masquage minimal du collecteur interne.
