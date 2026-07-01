# YaZoo - Notes de revue SonarQube locale

Date : 2026-07-01

## Contexte

Le Quality Gate local est indique comme passe, mais l'export initial Sonar signalait :

- 1 bug
- 20 security hotspots a revoir
- 224 code smells
- coverage Sonar : 46,9 %
- duplications Sonar : 16,9 %

Ces notes documentent les corrections faites localement et les hotspots a traiter dans l'interface SonarQube avec un token local. Aucun secret n'est stocke ici.

## Corrections appliquees

- `frontend/src/components/feed/PostCard.jsx` : suppression d'un ternaire inutile qui retournait toujours la meme valeur.
- `frontend/src/lib/appConfig.js` : remplacement du regex de suppression des slashs finaux par une boucle bornee.
- `frontend/src/contexts/ToastContext.jsx` : suppression de `Math.random()` pour les identifiants de toasts, remplace par un compteur local.
- `backend/app/Support/Auth/PhoneOtpBroker.php` : remplacement de `sha1($phone)` par `hash_hmac('sha256', $phone, APP_KEY)` pour les cles de cache OTP.
- Plusieurs pages React : suppression de l'usage de `void` sur des appels asynchrones ignores.
- `sonar-project.properties` : exclusions CPD/coverage limitees aux traductions, tests, points d'entree et routes, afin de ne pas penaliser les fichiers sans logique metier.

## Security hotspots exportes

### Traductions i18n signalees comme credentials

Fichier : `frontend/src/lib/i18n.js`

Sonar a signale 12 occurrences de la regle `javascript:S2068`. Elles correspondent a des textes visibles de type mot de passe / password dans les traductions FR/AR/EN, pas a des secrets reels. Revue recommandee dans Sonar : `SAFE`, avec justification "libelles de formulaire i18n, aucune valeur secrete".

### Regex URL API

Fichier : `frontend/src/lib/appConfig.js`

Le regex de trim des slashs finaux a ete supprime. Le regex simple `/\/api$/i` reste borne et applique a une URL de configuration courte ; il ne presente pas le meme risque de backtracking super-lineaire.

### Taille upload

Fichiers :

- `backend/app/Http/Requests/Community/StoreCommunityRequest.php`
- `backend/app/Http/Requests/Feed/StorePostRequest.php`
- `backend/app/Http/Requests/Feed/StoreStoryRequest.php`
- `backend/app/Http/Requests/Profile/UpdateProfileRequest.php`

Les limites d'upload sont explicites (`max:51200` pour medias feed/communautes/stories, `max:10240/12288` pour avatar/couverture). Risque accepte temporairement pour permettre video courte et images de profil, a accompagner en production par limites serveur, antivirus/scan media si possible, rate limiting et stockage prive pour documents sensibles.

### Identifiants de toast

Fichier : `frontend/src/contexts/ToastContext.jsx`

`Math.random()` a ete supprime. Les IDs sont maintenant generes par timestamp + compteur local.

### Cache OTP telephone

Fichier : `backend/app/Support/Auth/PhoneOtpBroker.php`

`sha1` a ete remplace par HMAC SHA-256 avec `APP_KEY`. Cela evite un hash faible et non cle pour l'identifiant telephone en cache.

## Action manuelle Sonar requise

Le token `SONAR_TOKEN` n'etait pas defini dans la session au moment de relancer `scripts/run-sonar.ps1`. Pour finaliser la revue :

1. Definir un token local SonarQube dans la session PowerShell.
2. Relancer `.\scripts\run-sonar.ps1`.
3. Ouvrir Security Hotspots dans SonarQube.
4. Marquer comme `SAFE` les libelles i18n detectes comme credentials.
5. Marquer comme `ACKNOWLEDGED` ou corriger les limites upload selon la politique production retenue.

## Limites

Cette revue est un audit local de qualite code. Elle ne remplace pas un audit de securite applicatif complet, ni une validation juridique CNDP/ONSSA.
