# Audit UI / i18n / Responsive YaZoo

Date: 2026-06-18

## Fichiers inspectes

- `frontend/src/layouts/Layout.jsx`
- `frontend/src/pages/LandingPage.jsx`
- `frontend/src/pages/FeedPage.jsx`
- `frontend/src/components/feed/PostCard.jsx`
- `frontend/src/components/feed/CreatePost.jsx`
- `frontend/src/components/marketplace/MarketplaceCommon.jsx`
- `frontend/src/components/ui/LanguageSwitcher.jsx`
- `frontend/src/components/ui/OptimizedImage.jsx`
- `frontend/src/contexts/I18nContext.jsx`
- `frontend/src/lib/i18n.js`
- `frontend/src/utils/media.js`
- `frontend/src/utils/formatDate.js`
- `frontend/src/index.css`
- `frontend/public/staticwebapp.config.json`
- `frontend/staticwebapp.config.json`
- `frontend/package.json`
- `backend/app/Http/Middleware/SetApiLocale.php`
- `backend/app/Http/Middleware/SecurityHeaders.php`
- `backend/routes/api.php`

## Problemes trouves

- Le badge de synchronisation/realtime etait rendu dans le layout et pouvait afficher un pill type `Sync 30s`.
- Le selecteur de langue ne proposait pas toutes les langues demandees et utilisait encore `de`.
- La detection navigateur n'etait pas appliquee correctement au premier chargement.
- Le backend ne lisait pas `Accept-Language` et limitait la locale API a `fr/ar`.
- Plusieurs zones horizontales mobile utilisaient des styles differents ou pouvaient wrapper.
- Les medias de posts dependaient de champs deja normalises et n'avaient pas de fallback solide.
- L'image "Partage" de la landing utilisait `hero-bond.webp` au lieu de `hero1.webp`.

## Fichiers modifies

- `frontend/src/layouts/Layout.jsx`: suppression du pill realtime/sync, padding bottom mobile, labels dock tronques.
- `frontend/src/components/ui/LanguageSwitcher.jsx`: langues `fr/ar/en/es/nl/pt/it`, scroll horizontal, `aria-pressed`, labels accessibles.
- `frontend/src/lib/i18n.js`: locales actives, fallback, detection navigateur, variables, dates.
- `frontend/src/contexts/I18nContext.jsx`: `lang`, `dir`, classes `rtl/ltr`, persistance seulement au choix utilisateur.
- `backend/app/Http/Middleware/SetApiLocale.php`: support `Accept-Language` et locales `fr/ar/en/es/nl/pt/it`.
- `backend/composer.lock`: mise a jour `phpseclib/phpseclib` `3.0.53` vers `3.0.55` pour corriger l'audit securite Composer.
- `frontend/src/pages/LandingPage.jsx`: image "Partage" via `hero1.webp` et textes principaux i18n.
- `frontend/src/components/feed/PostCard.jsx`: media URL robuste, fallback, menu post traduit et position logique RTL.
- `frontend/src/components/feed/CreatePost.jsx`: tags en scroll horizontal mobile.
- `frontend/src/pages/FeedPage.jsx`: rows stories/utilisateurs en scroll horizontal unifie.
- `frontend/src/components/marketplace/MarketplaceCommon.jsx`: tabs marketplace traduits et scrollables.
- `frontend/src/utils/media.js`: `getMediaUrl` / `getPostMedia`.
- `frontend/src/utils/formatDate.js`: `Intl` selon locale active.
- `frontend/src/components/ui/OptimizedImage.jsx`: fallback en cas d'erreur image.
- `frontend/src/index.css`: utilitaires `yz-horizontal-scroll` et `yz-no-scrollbar`.
- `frontend/src/components/ui/HorizontalScrollSection.jsx`: composant reusable ajoute.
- `frontend/package-lock.json`: correctifs d'audit production npm (`form-data`, `engine.io-client`, `ws`).

## Tests executes

- `npm.cmd install`: OK, dependances a jour; npm signale 6 vulnerabilites existantes.
- `npm.cmd run lint`: OK.
- `npm.cmd run test -- --run`: OK, 11 fichiers / 25 tests.
- `npm.cmd run build`: OK, Vite build reussi; `hero1-DT5_7fac.webp` genere.
- `composer install`: OK, rien a installer.
- `php artisan route:list`: OK, 102 routes listees.
- `php artisan config:clear`: OK.
- `php artisan cache:clear`: echec local initial avec `Class "Redis" not found`; relance OK avec `CACHE_STORE=file`.
- `php artisan test`: OK, 78 tests / 460 assertions.
- `composer audit --no-interaction`: OK apres mise a jour `phpseclib/phpseclib`.
- Revalidation apres correctifs CI: `npm.cmd run lint`, `npm.cmd run test -- --run`, `npm.cmd run build`, `php artisan test`, `php artisan route:list`, `php artisan config:clear`: OK.
- Revalidation apres correctif audit npm: `npm.cmd audit --omit=dev`: OK, 0 vulnerabilite production; `npm.cmd run lint`, `npm.cmd run test -- --run`, `npm.cmd run build`: OK.

## Reprise apres execution incomplete precedente

- Ce qui avait ete fait: corrections partielles UI mobile, scroll horizontal, image "Partage" vers `hero1.webp`, detection navigateur, `Accept-Language`, fallback media, suppression du pill sync/realtime.
- Ce qui etait incomplet: support russe `ru` ajoute par erreur, absence de commit/push, absence de push DockerHub, absence de verification/deploiement Azure.
- Ce qui a ete corrige maintenant: suppression complete de `ru`, langues finales limitees a `fr/ar/en/es/nl/pt/it`, audit relu via `git status`, `git diff --stat` et `git diff`.
- Correctif CI ajoute: fallback API explicite en francais quand aucune locale n'est fournie, pour conserver les attentes des tests backend.
- Correctif securite ajoute: `phpseclib/phpseclib` mis a jour vers `3.0.55` apres echec GitHub Actions sur `composer audit`.
- Correctif securite frontend ajoute: `form-data` vers `4.0.6`, `engine.io-client` vers `6.6.6`, `ws` vers `8.21.0` apres echec GitHub Actions sur `npm audit --omit=dev`.
- DockerHub deja pousse pendant cette reprise: `5eef/yazoo-api:latest`, digest `sha256:fbf11973dac053c91d47a52e7b12d6ae13f550092c8c1e3b1648616d754584b2`.
- Azure deja verifie pendant cette reprise: backend configure sur `DOCKER|5eef/yazoo-api:latest`, `WEBSITES_PORT=8080`, `/health` HTTP 200; frontend `https://yazoo.azurewebsites.net` HTTP 200.

## Commandes restantes au moment de cette mise a jour

- Commit/push du correctif audit npm.
- Reverification Azure apres le nouveau push image et apres le workflow GitHub.

## Erreurs restantes / limites

- La traduction complete de tous les textes hardcodes du site entier reste plus large que ce correctif cible.
- Le support russe ajoute par erreur a ete supprime.
