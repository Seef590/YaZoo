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

## Reprise apres execution incomplete precedente

- Ce qui avait ete fait: corrections partielles UI mobile, scroll horizontal, image "Partage" vers `hero1.webp`, detection navigateur, `Accept-Language`, fallback media, suppression du pill sync/realtime.
- Ce qui etait incomplet: support russe `ru` ajoute par erreur, absence de commit/push, absence de push DockerHub, absence de verification/deploiement Azure.
- Ce qui a ete corrige maintenant: suppression complete de `ru`, langues finales limitees a `fr/ar/en/es/nl/pt/it`, audit relu via `git status`, `git diff --stat` et `git diff`.
- Ce qui a ete deploye reellement: a completer apres les commandes Git, DockerHub et Azure de cette reprise.

## Commandes non executees au moment de cette mise a jour

- `git add`, `git commit`, `git push`: en attente apres tests finaux OK.
- DockerHub `5eef/yazoo-api:latest`: en attente apres tests finaux OK.
- Commandes Azure: en attente apres tests finaux OK; aucune ressource Azure creee.

## Erreurs restantes / limites

- La traduction complete de tous les textes hardcodes du site entier reste plus large que ce correctif cible.
- Le support russe ajoute par erreur a ete supprime.
