# YaZoo - Preproduction readiness

Date: 2026-07-02

## Phases realisees

- Phase 1: export propre futur, partage securise, bootstrap admin securise,
  stockage media clarifie.
- Phase 2/2.5: socle paiement, idempotence, callbacks, CMI desactive, compatibilite
  `bank_transfer`, payloads masques.
- Phase 3A/3A.5: verification professionnelle avec documents prives, legal/CNDP
  configurable, formulations ONSSA prudentes.
- Phase 3B: UX marketplace, reservations, mobile, onboarding, skeletons.
- Phase 3C/3C.5: avis reels, favoris reels, agregats fiables, moderation avis,
  absence de faux scores/badges.
- Phase 4A: stabilisation Vitest, revue Sonar documentee, monitoring prepare,
  plan E2E, checklist preproduction.

## Etat tests

Les validations a conserver avant preproduction:

- `php artisan test`;
- `npm run lint`;
- deux runs consecutifs `npm test -- --run`;
- `npm run build`;
- `node scripts/audit-i18n.mjs`;
- `git diff --check`.

## Paiement / CMI

CMI reste desactive par defaut. L'integration actuelle est une preparation technique,
pas une certification bancaire production. La preproduction peut montrer le workflow
manuel `cash_on_pickup` et `bank_transfer`, ainsi que la structure future payments.

## CNDP / ONSSA

Le projet est techniquement mieux prepare: privacy, consentements, export/suppression,
stockage prive des documents professionnels, formulations prudentes. La conformite
CNDP/ONSSA reste a valider par un professionnel juridique/comptable et par les
autorites ou procedures competentes.

## Monitoring

Monitoring interne frontend prepare, masquage payload ajoute, variables Sentry/App
Insights documentees. Aucun monitoring externe n'est actif tant que les secrets et
ressources Azure ne sont pas configures.

## E2E

Playwright est pret a etre ajoute en base minimale pour des smoke tests locaux
non destructifs, mais il ne doit etre considere valide qu'apres installation des
navigateurs et execution reussie de `npm run test:e2e`. Les scenarios destructifs
restent documentes dans `docs/E2E_TEST_PLAN.md`.

## Avant deploiement preproduction

- Verifier toutes les variables Azure App Settings.
- Executer migrations sur une base preproduction, jamais `migrate:fresh`.
- Configurer backups et tester une restauration.
- Activer alertes disponibilite.
- Executer tests backend/frontend/i18n.
- Faire une revue manuelle mobile, RTL arabe et dark/light.
- Verifier que `.env`, dumps, logs, backups, zips et exports Sonar ne sont pas livres.

## Montrable a INDH comme MVP

- Marketplace sociale fonctionnelle.
- Reservations et paiements manuels.
- Moderation et signalement.
- Privacy technique et verification professionnelle privee.
- Preparation CMI documentee.
- Roadmap claire des risques restants.

## A ne pas presenter comme finalise

- CMI production.
- Conformite CNDP officielle.
- Certification ONSSA officielle.
- Monitoring externe actif.
- E2E complet automatise.
- Backup restore teste, si non realise separement.
