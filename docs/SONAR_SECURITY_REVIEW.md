# YaZoo - Sonar security review

Date: 2026-07-02

## Portee

Cette revue documente les hotspots locaux exportes dans `sonar-hotspots.json`.
Elle ne marque rien comme resolu dans SonarQube sans preuve, et ne remplace pas une
revue de securite applicative complete.

## Synthese hotspots

| Regle | Fichier | Statut Phase 4A | Justification | Preuve / prochaine action |
| --- | --- | --- | --- | --- |
| `javascript:S2068` | `frontend/src/lib/i18n.js` | Faux positif a qualifier dans Sonar | Les 12 occurrences sont des libelles i18n visibles autour de mots comme password/mot de passe, pas des secrets. | Audit i18n OK; marquer `SAFE` dans l'interface Sonar avec justification. |
| `javascript:S5852` | `frontend/src/lib/appConfig.js` | Corrige | Le test regex `/\/api$/i` a ete remplace par `toLowerCase().endsWith('/api')`. | `npm run lint`, `npm test -- --run`, `npm run build`. |
| `php:S5693` | `StoreCommunityRequest`, `StorePostRequest`, `StoreStoryRequest`, `UpdateProfileRequest` | Acknowledged, a revoir avant production lourde media | Les limites Laravel sont explicites: 50 Mo pour media feed/story/communaute, 10/12 Mo pour avatar/couverture. | Completer par limites serveur/proxy Azure, scan antivirus si requis, quotas et monitoring upload. |
| `javascript:S2245` | `frontend/src/contexts/ToastContext.jsx` | Corrige | L'identifiant toast n'utilise plus `Date.now()`; il repose sur un compteur local non securitaire. | L'identifiant n'est pas un token ni une valeur d'autorisation. |
| `php:S4790` | `backend/app/Support/Auth/PhoneOtpBroker.php` | Corrige precedemment | La cle de cache OTP utilise `hash_hmac('sha256', phone, APP_KEY)`, pas un hash faible nu. | `PhoneOtpBrokerTest` couvre l'absence d'exposition du telephone dans la cle. |

## Points non corriges volontairement

- Les libelles i18n ne doivent pas etre renommes artificiellement pour faire taire
  Sonar: cela degraderait l'UX sans benefice securite.
- Les limites upload ne sont pas abaissees brutalement en Phase 4A pour ne pas casser
  les stories/videos existantes. La mitigation production doit inclure Azure/nginx/PHP
  upload limits, rate limiting et supervision.
- Les exports Sonar locaux restent ignores par Git et ne doivent pas etre livres a une
  commission ou a un depot public.

## Procedure Sonar recommandee

1. Regenerer l'analyse locale avec un `SONAR_TOKEN` local non versionne.
2. Verifier que le hotspot regex a disparu apres reanalyse.
3. Marquer les libelles i18n comme `SAFE` avec justification.
4. Marquer les limites upload comme `ACKNOWLEDGED` tant que la politique media
   production n'est pas finalisee.
5. Garder les preuves de tests dans le dossier preproduction.
