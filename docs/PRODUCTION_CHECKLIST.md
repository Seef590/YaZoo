# YaZoo - Checklist production et depot

## Secrets et configuration

- [ ] Aucun `.env` dans le depot ou ZIP public.
- [ ] `APP_KEY` production generee et protegee.
- [ ] Secrets stockes dans un coffre adapte.
- [ ] Variables frontend production verifiees.
- [ ] OAuth Google configure avec domaines corrects.
- [ ] SMS OTP configure avec limites et journalisation.

## Base de donnees

- [ ] Migrations testees sans `migrate:fresh`.
- [ ] Backups automatiques planifies.
- [ ] Restauration testee.
- [ ] Comptes DB a privileges limites.
- [ ] Donnees de test nettoyees legalement.

## Securite applicative

- [ ] HTTPS force.
- [ ] Cookies secure/same-site en production.
- [ ] CORS limite aux domaines officiels.
- [ ] Rate limiting auth/OTP.
- [ ] Middleware admin actif.
- [ ] Utilisateurs suspendus limites sur actions sensibles.
- [ ] Exports sans secrets.
- [ ] Logs sans donnees sensibles.

## CNDP / Loi 09-08

- [ ] Responsable du traitement complete.
- [ ] Contact donnees personnelles complete.
- [ ] Formalite CNDP evaluee.
- [ ] Politique privacy validee.
- [ ] Durees de conservation validees.
- [ ] Procedure suppression/rectification/opposition documentee.
- [ ] Registre des consentements actif.

## ONSSA / marketplace animaux

- [ ] Textes valides juridiquement.
- [ ] Procedure verification pro documentee.
- [ ] Moderation annonces sensibles active.
- [ ] Stockage prive documents pret.
- [ ] Formation moderateurs.
- [ ] Contact autorites competentes defini si besoin.

## Admin et gouvernance

- [ ] Roles admin verifies.
- [ ] Historique moderation consulte regulierement.
- [ ] Exports CSV controles.
- [ ] Suspension sans suppression privilegiee.
- [ ] Procedure de reclamation active.
- [ ] Journalisation retention definie.

## Tests et qualite

- [ ] `php artisan test` OK.
- [ ] `npm run lint` OK.
- [ ] `npm test -- --run` OK.
- [ ] `npm run build` OK.
- [ ] Audit i18n OK.
- [ ] Tests manuels mobile.
- [ ] Tests RTL arabe.
- [ ] Tests dark/light.

## PWA / SEO / accessibilite

- [ ] Manifest verifie.
- [ ] Service worker prudent.
- [ ] Robots.txt verifie.
- [ ] Sitemap avec domaine final.
- [ ] Meta par route ou prerender planifie.
- [ ] Skip link actif.
- [ ] Focus visible.
- [ ] Audit WCAG manuel.
- [ ] Tests lecteur d'ecran.

## Monitoring et exploitation

- [ ] Monitoring erreurs.
- [ ] Alertes disponibilite.
- [ ] Rotation logs.
- [ ] Plan incident.
- [ ] Plan sauvegarde/restauration.
- [ ] Documentation exploitation.
- [ ] Support utilisateur FR/AR.

## Depot INDH

- [ ] ZIP propre genere.
- [ ] `.git`, `.env`, logs, backups exclus.
- [ ] Dossier technique joint.
- [ ] Plan action joint.
- [ ] Risques et conformite joints.
- [ ] Captures ou demo locale preparees.
