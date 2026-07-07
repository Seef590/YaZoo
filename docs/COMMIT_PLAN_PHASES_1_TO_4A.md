# YaZoo - Commit plan phases 1 to 4A

Date: 2026-07-02

Ce document propose un decoupage logique. Il ne remplace pas une revue humaine du
diff et ne demande aucun commit automatique.

## Ordre recommande

### 1. `security: harden admin bootstrap and sharing workflow`

Fichiers principaux:

- `deploy/export-indh-clean.ps1`
- `docs/SECURITY_SHARING.md`
- `docs/README_COMMISSION.md`
- `backend/app/Services/AuthService.php`
- `backend/app/Console/Commands/CreateAdmin.php`
- `backend/config/auth.php`
- `backend/routes/console.php`
- `backend/tests/Feature/Auth/AuthApiTest.php`

Raison: retirer le risque de premier utilisateur admin en production et preparer
un export propre futur.

Tests avant commit: `php artisan test --filter=AuthApiTest`, `git diff --check`.

Risques: verifier qu'aucun `.env` reel ni zip n'est inclus.

### 2. `payments: add gateway-based payment foundation`

Fichiers principaux:

- `backend/config/payments.php`
- migrations `create_payments_table`, `create_payment_transactions_table`
- `backend/app/Models/Payment.php`
- `backend/app/Models/PaymentTransaction.php`
- `backend/app/Services/Payments/**`
- `backend/app/Http/Controllers/Api/PaymentController.php`
- `docs/PAYMENTS_ARCHITECTURE.md`
- `docs/CMI_INTEGRATION_PREPARATION.md`

Raison: ajouter le socle paiement extensible sans activer CMI.

Tests avant commit: `php artisan test --filter=PaymentApiTest`.

Risques: migrations neuves a relire avant toute base partagee; CMI doit rester
`false`.

### 3. `payments: harden CMI-disabled flow and callbacks`

Fichiers principaux:

- `backend/app/Services/Payments/CmiGateway.php`
- `backend/app/Services/Payments/PaymentService.php`
- `backend/app/Models/PaymentTransaction.php`
- `backend/routes/web.php`
- `backend/tests/Feature/Payments/PaymentApiTest.php`
- frontend reservation payment labels

Raison: confirmer que retours navigateur ne mutent rien, que callbacks invalides
sont refuses et que payloads sensibles sont masques.

Tests avant commit: `php artisan test --filter=PaymentApiTest`.

Risques: ne pas presenter la preparation CMI comme integration production.

### 4. `compliance: add private professional verification and legal readiness`

Fichiers principaux:

- migration professional verifications
- `ProfessionalVerificationController`
- requests/resources verification pro
- `backend/config/legal.php`
- `backend/tests/Feature/ProfessionalVerificationApiTest.php`
- `docs/CNDP_PRIVACY_READINESS.md`

Raison: stocker les documents professionnels en prive et clarifier CNDP/legal.

Tests avant commit: `php artisan test --filter=ProfessionalVerificationApiTest`.

Risques: verifier qu'aucun `document_path` n'est expose publiquement.

### 5. `trust: add trust safety page and prudent ONSSA/CNDP wording`

Fichiers principaux:

- `frontend/src/pages/TrustSafetyPage.jsx`
- `frontend/src/pages/TrustSafetyPage.test.jsx`
- `frontend/src/lib/i18n.js`
- docs ONSSA/CNDP/INDH
- resources marketplace prudentes

Raison: afficher la confiance sans promettre certification officielle.

Tests avant commit: `npm run lint`, `npm test -- --run`, audit i18n.

Risques: relire toutes les formulations ONSSA/CNDP.

### 6. `ux: improve marketplace reservations onboarding and skeletons`

Fichiers principaux:

- marketplace cards/pages
- `ReservationsPage.jsx`
- `OnboardingPrompt.jsx`
- `SkeletonBlock.jsx`
- messages/notifications UI
- `frontend/src/lib/i18n.js`

Raison: ameliorer lisibilite mobile, timeline, empty states et onboarding.

Tests avant commit: `npm run lint`, deux runs `npm test -- --run`, `npm run build`.

Risques: surveiller RTL et mobile; ne pas afficher de faux paiement en ligne.

### 7. `trust: add real reviews favorites and social proof`

Fichiers principaux:

- migrations reviews/favorites
- `ReservationReviewController`
- `AdminReservationReviewController`
- `FavoriteController`
- models/resources marketplace
- `backend/tests/Feature/SocialTrustApiTest.php`
- frontend favorites/cards
- `docs/SOCIAL_TRUST_FEATURES.md`
- `docs/REVIEWS_AND_RATINGS_POLICY.md`

Raison: exposer uniquement des avis, favoris et agregats reels.

Tests avant commit: `php artisan test --filter=SocialTrustApiTest`, tests frontend
marketplace.

Risques: aucun faux score, aucun type polymorphe brut, pas de badge invente.

### 8. `quality: stabilize tests monitoring docs and preproduction checklist`

Fichiers principaux:

- `frontend/vite.config.js`
- `frontend/src/test/setup.js`
- `frontend/src/lib/appConfig.js`
- `backend/app/Http/Controllers/Api/MonitoringController.php`
- `backend/tests/Feature/MonitoringApiTest.php`
- `docs/SONAR_SECURITY_REVIEW.md`
- `docs/MONITORING_AND_ALERTING.md`
- `docs/E2E_TEST_PLAN.md`
- `docs/PREPRODUCTION_READINESS.md`
- `docs/PRODUCTION_CHECKLIST.md`

Raison: stabiliser Vitest, documenter Sonar, preparer monitoring sans secret.

Tests avant commit: backend complet, frontend complet, audit i18n, `git diff --check`.

Risques: monitoring externe reste non actif; ne pas ajouter de DSN reel.

### 9. `test: add minimal local Playwright smoke e2e`

Fichiers principaux:

- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/playwright.config.js`
- `frontend/e2e/public-smoke.spec.js`
- `frontend/.env.e2e.example`
- `.gitignore`
- `frontend/.gitignore`

Raison: ajouter une base E2E locale non destructive pour pages publiques,
redirection marketplace invite et onboarding avec API mockee.

Tests avant commit: `npm run lint`, deux runs `npm test -- --run`, `npm run build`,
`npm run test:e2e` apres installation de Chromium Playwright.

Risques: navigateur Playwright a installer localement; ne pas bloquer `npm test`.

## Validation globale avant sequence de commits

1. `composer install`
2. `php artisan config:clear`
3. `php artisan test`
4. `npm ci`
5. `npm run lint`
6. `npm test -- --run`
7. `npm test -- --run`
8. `npm run build`
9. `node scripts/audit-i18n.mjs`
10. `git diff --check`
11. Revue secrets du diff
