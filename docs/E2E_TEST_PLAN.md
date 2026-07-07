# YaZoo - E2E test plan

Date: 2026-07-02

## Decision Phase 4A

Playwright reste une base E2E a valider avant commit si les navigateurs locaux ne
sont pas encore installes. Le projet ne doit pas rendre `npm test` dependant de
Playwright et les smoke tests E2E doivent rester separes de Vitest.

## Mise a jour Phase 4B

Base Playwright minimale a ajouter ou a conserver seulement apres validation:

- `frontend/playwright.config.js`;
- `frontend/e2e/public-smoke.spec.js`;
- scripts `npm run test:e2e` et `npm run test:e2e:ui`;
- `frontend/.env.e2e.example`.

Les tests Phase 4B couvrent uniquement des chemins non destructifs: landing,
`/trust`, formulaire login, redirection marketplace invite, onboarding avec API
mockee. Les scenarios create/update/reservation/admin restent planifies car ils
necessitent des fixtures locales isolees.

## Principes

- Ne jamais utiliser de donnees production.
- Ne jamais utiliser de secrets reels.
- Executer contre une base preproduction jetable ou resettable.
- Desactiver les tests E2E par defaut si `E2E_BASE_URL` ou les comptes de test sont absents.
- Ne pas activer CMI; utiliser uniquement paiement manuel et CMI disabled.

## Scenarios prioritaires

1. Inscription utilisateur.
2. Login et logout.
3. Creation d'un post feed.
4. Creation d'une annonce animal.
5. Reservation animal ou produit.
6. Finalisation reservation manuelle par vendeur.
7. Avis apres reservation terminee.
8. Favori annonce.
9. Signalement contenu.
10. Admin moderation simple.
11. Export privacy si donnees test disponibles.
12. Page `/trust`.

## Variables proposees plus tard

```dotenv
E2E_BASE_URL=http://localhost:4173
E2E_API_URL=http://localhost:8000/api
E2E_USER_EMAIL=
E2E_USER_PASSWORD=
E2E_ADMIN_EMAIL=
E2E_ADMIN_PASSWORD=
```

Ces variables doivent rester locales ou dans GitHub Secrets preproduction.

## Prochaine implementation

1. Installer les navigateurs Playwright localement: `npm exec playwright install chromium`.
2. Ajouter des fixtures de creation utilisateur via API locale.
3. Ajouter tags `@critical` pour smoke preproduction.
4. Executer dans CI uniquement apres stabilisation backend/frontend.
