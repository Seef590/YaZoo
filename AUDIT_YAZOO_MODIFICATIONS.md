# AUDIT_YAZOO_MODIFICATIONS

## 1. Audit initial

Architecture detectee :
- Backend Laravel dans `backend/`, API dans `backend/routes/api.php`, auth Sanctum, notifications Laravel, policies, resources, requests, tests feature/unit.
- Frontend React/Vite dans `frontend/`, routes dans `frontend/src/App.jsx`, layout authentifie dans `frontend/src/layouts/Layout.jsx`, API clients Axios dans `frontend/src/api`.
- Infra locale : `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, Nginx dans `infra/nginx`.

Modeles backend existants :
- `User`, `Post`, `Comment`, `Like`, `Story`, `StoryView`, `Animal`, `Product`, `Reservation`, `ReservationReview`, `Community`, `CommunityMember`, `Conversation`, `Message`.
- Reservations existantes deja polymorphes via `reservable_type` / `reservable_id`, avec `buyer_id` et `seller_id`.

Routes API existantes avant modification :
- Auth : register/login/logout/me/Google/OTP.
- Feed : posts, likes, comments, stories.
- Marketplace : animals, products.
- Reservations : anciennes routes `POST /api/animals/{animal}/reservations`, `POST /api/products/{product}/reservations`, actions approve/reject/cancel/complete.
- History commandes : `GET /api/orders/history`.
- Admin : users, orders, moderation.

Pages frontend existantes :
- Landing, login/register, feed, profile, animals marketplace, products marketplace, details animal/product, reservations, order history, invoice, messages, notifications, communities, admin moderation/orders, contact, settings.

Systeme i18n actuel :
- Dictionnaires dans `frontend/src/lib/i18n.js`.
- Provider dans `frontend/src/contexts/I18nContext.jsx`.
- Switcher dans `frontend/src/components/ui/LanguageSwitcher.jsx`.
- Middleware backend `SetApiLocale` present.

Logiques detectees :
- Marketplace animaux/produits : CRUD complet, media, policies, resources, tests.
- Reservation : logique commande/reservation robuste pour animaux et produits, notifications, livraison, facture.
- Historique : historique de commandes via reservations, pas encore d'historique global d'activite.

Risques avant modification :
- Ajouter une seconde logique de reservation aurait casse les commandes existantes.
- Les routes frontend/backend contenaient encore des textes systeme hardcodes.
- Le backend ne proposait pas encore de service animalier reservable.
- Les actions de reservation ne tracaient pas encore un journal global.

Plan technique applique :
- Etendre les reservations existantes au lieu de creer une table concurrente.
- Ajouter `ServiceListing` pour gardiennage/dressage.
- Ajouter `ActivityLog` + `ActivityLogger`.
- Ajouter `POST /api/reservations` comme entree unifiee.
- Garder les anciennes routes animal/produit compatibles.
- Ajouter une page frontend Assistance/services.
- Ajouter Accept-Language sur toutes les requetes Axios et tests i18n RTL/LTR.

## 2. Fichiers modifies

Backend :
- `backend/routes/api.php` : routes services, history, reservation unifiee et actions PATCH.
- `backend/app/Models/Reservation.php` : champs category, scheduled/contact/provider/admin/rejected.
- `backend/app/Models/User.php` : relations service listings et activity logs.
- `backend/app/Models/ServiceListing.php` : nouveau modele services animaliers.
- `backend/app/Models/ActivityLog.php` : nouveau modele historique global.
- `backend/app/Services/ReservationService.php` : resolution backend des ressources et creation animal/product/pet_sitting/training.
- `backend/app/Services/ActivityLogger.php` : service centralise de journalisation.
- `backend/app/Http/Controllers/Api/ReservationController.php` : endpoint unifie et show.
- `backend/app/Http/Controllers/Api/ServiceListingController.php` : CRUD/list/feed/types services.
- `backend/app/Http/Controllers/Api/HistoryController.php` : historique utilisateur.
- `backend/app/Http/Requests/Reservation/StoreReservationRequest.php` : validation unifiee.
- `backend/app/Http/Requests/ServiceListing/*` : validation create/update services.
- `backend/app/Http/Resources/Reservation/ReservationResource.php` : category/status/provider/reservable/actions.
- `backend/app/Http/Resources/ServiceListingResource.php` : JSON services.
- `backend/app/Http/Resources/ActivityLogResource.php` : JSON historique.
- `backend/app/Policies/ReservationPolicy.php` : admin + prestataire/client.
- `backend/app/Policies/ServiceListingPolicy.php` : proprietaire/admin.
- `backend/app/Providers/AuthServiceProvider.php` : policy ServiceListing.
- `backend/database/migrations/2026_06_17_000000_create_service_listings_table.php`.
- `backend/database/migrations/2026_06_17_000001_expand_reservations_for_unified_requests.php`.
- `backend/database/migrations/2026_06_17_000002_create_activity_logs_table.php`.
- `backend/database/factories/ServiceListingFactory.php`.
- `backend/tests/Feature/Reservation/ReservationApiTest.php`.

Frontend :
- `frontend/src/App.jsx` : route `/marketplace/services`.
- `frontend/src/api/client.js` : envoi `Accept-Language`.
- `frontend/src/api/reservations.js` : `createReservationRequest`.
- `frontend/src/api/services.js` : client API services.
- `frontend/src/components/marketplace/MarketplaceCommon.jsx` : onglet Assistance.
- `frontend/src/components/marketplace/ServiceCard.jsx` : carte service + reservation + WhatsApp.
- `frontend/src/pages/ServicesMarketplacePage.jsx` : page Assistance.
- `frontend/src/layouts/Layout.jsx` : lien Assistance.
- `frontend/src/contexts/I18nContext.jsx` : classe globale `rtl`.
- `frontend/src/lib/i18n.js` : cles contact/services/reservations/errors fr/ar.
- `frontend/src/pages/ContactPage.jsx` : textes i18n, WhatsApp traduit.
- `frontend/src/contexts/I18nContext.test.jsx` : tests RTL/LTR/persistence/cles critiques.

## 3. Backend ajoute/modifie

Modeles :
- `ServiceListing` : types `pet_sitting`, `training`; statuts `draft`, `active`, `paused`, `rejected`, `archived`.
- `ActivityLog` : action, category, actor/user, subject polymorphe, metadata minimale.
- `Reservation` reste le modele unifie pour les demandes.

Migrations :
- `service_listings` pour gardien/gardienne et dresseur/dresseuse.
- Extension additive de `reservations` avec `category`, `scheduled_at`, `contact_phone`, `provider_note`, `admin_note`, `rejected_at`.
- `activity_logs` pour l'historique global.

Routes creees/modifiees :
- Services : `GET/POST /api/services`, `GET /api/services/{service}`, `PUT/PATCH/DELETE /api/services/{service}`, `GET /api/my/services`, `GET /api/services/types`, `GET /api/services/feed`.
- Reservations : `POST /api/reservations`, `GET /api/reservations/{reservation}`, PATCH actions approve/reject/cancel/complete, anciennes routes conservees.
- Historique : `GET /api/history`, `GET /api/history/me`.

Exemple request unifie :
```json
{
  "category": "training",
  "reservable_id": 12,
  "quantity": 1,
  "scheduled_at": "2026-06-18T10:00:00Z",
  "message": "Je souhaite une seance de dressage.",
  "contact_phone": "+212600000000"
}
```

Exemple response :
```json
{
  "data": {
    "id": 34,
    "category": "training",
    "status": "pending",
    "provider": { "id": 7, "name": "Prestataire" },
    "reservable": { "id": 12, "title": "Education canine", "routePath": "/marketplace/services/12" },
    "canApprove": false,
    "canCancel": true
  }
}
```

Confirmation importante :
- Le frontend n'envoie jamais `provider_id` ou `seller_id`.
- Le backend calcule toujours le vendeur/prestataire depuis `Animal.user_id`, `Product.user_id` ou `ServiceListing.user_id`.

## 4. I18n

Corrige :
- `Accept-Language` est envoye avec chaque requete API.
- `ar` applique `lang="ar"`, `dir="rtl"` et classe `rtl`.
- `fr` applique `lang="fr"` et `dir="ltr"`.
- `LanguageSwitcher` persiste via `localStorage`.
- Page Contact : "Ouvrir WhatsApp" devient `فتح WhatsApp` en arabe, bouton vert avec texte noir conserve en light/dark.

Cles ajoutees :
- `contact.*`, `services.*`, `services.priceTypes.*`, `errors.generic`, `common.all`, `common.assistance`, `reservations.requestSent`, `reservations.bookSession`, `reservations.messagePlaceholder`.

Non traduits volontairement :
- YaZoo, WhatsApp, emails, numeros, URLs, noms utilisateur, contenus crees par utilisateurs.

## 5. Services et reservations marketplace

Gardien/Gardienne :
- Service `type=pet_sitting`, affichage dans Assistance, reservation via `category=pet_sitting`.

Dresseur/Dresseuse :
- Service `type=training`, affichage dans Assistance, reservation via `category=training`.

Animal :
- `POST /api/reservations` avec `category=animal` ou ancienne route.
- Verifie disponible, bloque propre annonce, reserve l'animal.

Produit :
- `POST /api/reservations` avec `category=product` ou ancienne route.
- Verifie stock disponible, bloque propre produit, respecte quantity.

Statuts :
- `pending`, `approved`, `rejected`, `cancelled`, `completed`.
- Prestataire/vendeur/admin : approve, reject, complete.
- Client/admin : cancel.

## 6. Historique global

Table :
- `activity_logs`.

Endpoint :
- `GET /api/history`, `GET /api/history/me`.

Actions tracees dans cette tranche :
- `service.created`, `service.updated`, `service.deleted`.
- `reservation.created`, `reservation.approved`, `reservation.rejected`, `reservation.cancelled`, `reservation.completed`.

Note :
- Le service `ActivityLogger` est pret pour etendre ensuite posts/comments/stories/communautes/profil/admin sans dupliquer la logique.

## 7. Tests executes

Frontend :
- `npm.cmd run lint` : OK.
- `npm.cmd test -- --run` : OK, 11 fichiers, 25 tests.
- `npm.cmd run build` : OK, build Vite genere.

Backend :
- `php artisan route:list` : OK, 99 routes.
- `docker exec yazoo-app-1 php artisan migrate:status` : OK, toutes les migrations attendues sont `Ran`.
- `php artisan test tests\Feature\Reservation\ReservationApiTest.php` : OK, 10 tests, 92 assertions.
- `php artisan test` : OK, 76 tests, 453 assertions.

Docker :
- `docker compose config` : OK.
- `docker compose build` : OK.

## 8. Problemes restants

- Le chantier demande une traduction exhaustive de toutes les pages existantes. Cette tranche corrige le socle i18n, Contact, services et les cles critiques testees, mais il reste des textes hardcodes historiques dans plusieurs pages existantes.
- Le feed organique des services expose un endpoint backend `GET /api/services/feed`, mais l'insertion visuelle dans `FeedPage` n'a pas ete finalisee dans cette tranche.
- Les actions feed/communautes/profil/admin ne sont pas encore toutes connectees a `ActivityLogger`; le service central est en place.
- Les routes admin services/reservations dediees ne sont pas encore ajoutees; l'admin peut agir via policies sur reservations, mais pas via un dashboard services separe.

## 9. Passe finale UI, RTL, follow et nettoyage - 2026-06-17

Problemes detectes :
- Les panneaux de creation marketplace etaient visibles en continu ou utilisaient un bouton trop generique.
- Les tests marketplace echouaient quand plusieurs boutons `Afficher` etaient presents.
- Les images de post etaient contraintes par le padding interne de la carte.
- Le header/menu mobile RTL avait encore des alignements physiques gauche/droite.
- Le feed ne recevait pas encore `author.isFollowing`, donc le bouton suivre ne pouvait pas etre fiable dans `PostCard`.
- La couverture profil etait trop assombrie par l'overlay global.

Corrections realisees :
- `frontend/src/components/ui/CollapsiblePanel.jsx` accepte `showLabel` et `hideLabel`, garde `aria-expanded` et conserve le contenu monte pour ne pas perdre les champs.
- `frontend/src/pages/AnimalsMarketplacePage.jsx`, `ProductsMarketplacePage.jsx`, `CommunitiesPage.jsx` replient les formulaires de creation et affichent des boutons explicites.
- `frontend/src/components/ui/FollowButton.jsx` ajoute un bouton follow/following reutilisable avec etat loading, erreurs et traduction.
- `frontend/src/components/feed/PostCard.jsx` affiche Follow/Following sur les posts d'autres utilisateurs, traduit les libelles photo/commentaires/partages/reactions, et rend le media full width sans changer les hauteurs existantes.
- `backend/app/Http/Resources/Feed/PostResource.php` expose `author.isFollowing` depuis la relation existante.
- `frontend/src/pages/ProfilePage.jsx` reutilise `FollowButton` et allege l'overlay de couverture pour garder une vraie image claire.
- `frontend/src/layouts/Layout.jsx` traduit plusieurs libelles fixes et corrige le drawer/bottom nav en RTL.
- `frontend/src/index.css` ajoute une protection globale anti overflow horizontal et des aides RTL.
- `frontend/src/lib/i18n.js` ajoute les cles FR/AR pour follow, creation, feed, post et libelles communs.
- `frontend/src/pages/AnimalsMarketplacePage.test.jsx` et `ProductsMarketplacePage.test.jsx` ouvrent maintenant le panneau de creation via le bon bouton traduit.

Fichiers supprimes apres verification comme artefacts generes ou temporaires :
- `frontend/dist`
- `frontend/coverage`
- `frontend/mobile-shots`
- `backend/serve.err.log`
- `backend/serve.out.log`
- `frontend/dev.err.log`
- `frontend/dev.out.log`
- `frontend/dev2.err.log`
- `frontend/dev2.out.log`
- `frontend/preview.err.log`
- `frontend/preview.out.log`
- `frontend/vite.err.log`
- `frontend/vite.out.log`
- `backend/bootstrap/cache/serFE57.tmp`

Fichiers conserves volontairement :
- `docs/rapport_yazoo_uml/`, `docs/soutenance/`, `scripts/build_rapport_yazoo_uml.py`, `scripts/build_yazoo_soutenance_pptx.py` car ils ressemblent a des livrables/documentation utiles et ne sont pas des caches evidents.
- `backend/storage/logs/*`, backups infra, migrations, seeders, assets, Dockerfiles et scripts deploy.

Tests relances apres cette passe :
- `npm.cmd run lint` : OK.
- `npm.cmd test -- --run` : OK, 11 fichiers, 25 tests.
- `npm.cmd run build` : OK.
- `php artisan route:list` : OK, 99 routes.
- `docker exec yazoo-app-1 php artisan migrate:status` : OK.
- `php artisan test` : OK, 76 tests, 453 assertions.
- `docker compose config` : OK.
- `docker compose build` : OK.

Statut avant deploiement :
- Branche locale : `safe-ui-audit-fixes`.
- Les ressources Azure existantes restent ciblees : `yazoo` et `yazoo-api`.
- Images DockerHub ciblees : `5eef/yazoo-frontend:latest` et `5eef/yazoo-api:latest`.

## 10. Deploiement final - 2026-06-17

GitHub :
- Commits pousses sur `origin/safe-ui-audit-fixes` : `7fe04f5` pour les corrections, `c2d0847` pour le rapport de deploiement.
- Les dossiers non lies `docs/rapport_yazoo_uml/`, `docs/soutenance/`, `scripts/build_rapport_yazoo_uml.py`, `scripts/build_yazoo_soutenance_pptx.py` restent non suivis et non deployes.

DockerHub :
- `5eef/yazoo-api:latest` pousse avec digest `sha256:84b7f3565e1fd86eed98cb305e2cf8690246499908ad3c58309a015792d2c3e8`.
- `5eef/yazoo-frontend:latest` pousse avec digest `sha256:7d7dbc12a7bc5e5504570c20bed1c2b729d3981c6650716de3b96c4255151670`.

Azure :
- App Service backend existant `yazoo-api` mis a jour vers `5eef/yazoo-api:latest`, aucune nouvelle ressource creee.
- App Service frontend existant `yazoo` mis a jour vers `5eef/yazoo-frontend:latest`, aucune nouvelle ressource creee.
- Redemarrage effectue pour `yazoo-api` et `yazoo`.

Verifications publiques apres deploiement :
- `https://yazoo.azurewebsites.net/` : HTTP 200.
- `https://yazoo.azurewebsites.net/contact` : HTTP 200.
- `https://yazoo.azurewebsites.net/LICENSE.txt` : HTTP 200, licence MIT exposee.
- `https://yazoo-api.azurewebsites.net/health/ready` : HTTP 200.

## 11. Messagerie privee, liens contact et feed utilisateurs - 2026-06-17

Audit complementaire :
- Les tables `conversations` et `messages` existaient deja avec une conversation directe par colonnes `participant_one_id` / `participant_two_id`.
- Aucun doublon de table n'a ete cree. La correction reste additive et compatible avec l'ancien endpoint `POST /api/conversations`.
- La messagerie avait deja notifications, resource, tests et websocket event, mais pas les routes attendues `/conversations/direct` et `/conversations/{conversation}/read`.
- Les liens marketplace/reservations utilisaient encore `email` comme identifiant de contact.
- `Layout.jsx` affichait encore le libelle UI `Sync 30s`.
- Le feed ne chargeait pas encore une section utilisateurs inscrits/suggestions.

Corrections backend :
- `backend/routes/api.php` ajoute :
  - `POST /api/conversations/direct`
  - `PATCH /api/conversations/{conversation}/read`
  - `GET /api/users/suggestions`
- `StoreConversationRequest` accepte `user_id` en alias de `recipient_id` et garde la compatibilite `recipient_email`.
- `StoreMessageRequest` limite maintenant `body` a 5000 caracteres.
- `ConversationController` reutilise la logique anti-doublon existante pour `/direct`, marque une conversation lue via `/read`, marque les notifications message comme lues et journalise :
  - `message.conversation_started`
  - `message.sent`
  - `message.read`
- `MessageController` journalise `message.sent` sans stocker le contenu du message dans l'historique.
- `ConversationResource` n'expose plus l'email public du participant dans la conversation et fournit aussi les champs compatibles `latest_message`, `unread_count`, `created_at`, `updated_at`.
- `MessageResource` fournit `conversation_id`, `sender_id`, `is_own`, `created_at`, `read_at`, `edited_at`, `deleted_at`.
- `UserController@suggestions` retourne jusqu'a 20 utilisateurs hors utilisateur connecte.
- `UserResource` expose `username`, `isFollowing`, `followersCount`, `followingCount`, `profileUrl`.

Corrections frontend :
- `frontend/src/api/messages.js` ajoute `createDirectConversationRequest` et `markConversationReadRequest`.
- `frontend/src/pages/MessagesPage.jsx` supporte :
  - `/messages`
  - `/messages?conversation=ID`
  - `/messages?user=USER_ID`
  - `/messages?user=USER_ID&message=TEXTE`
  - compatibilite ancienne `/messages?email=...`
- Quand `user=ID` est present, le frontend appelle `POST /api/conversations/direct`, ouvre la conversation et conserve le message initial en brouillon.
- L'ouverture d'une conversation appelle explicitement `PATCH /api/conversations/{id}/read`.
- La recherche messages filtre localement pendant la saisie.
- `Enter` envoie le message et `Shift+Enter` garde une nouvelle ligne.
- Les bulles messages tiennent compte du RTL.
- `ProfilePage` utilise `/conversations/direct` avec `user_id` pour le bouton Message.
- `marketplaceUtils`, `AnimalDetailPage`, `ProductDetailPage` et `ReservationsPage` remplacent les liens `?email=` par `?user=`.
- `Layout.jsx` n'affiche plus `Sync 30s` ni le fallback `Sync secours`.
- `FeedPage` charge `GET /api/users/suggestions` et affiche une section `Utilisateurs a decouvrir` avec avatar, profil, Follow et Message.
- `frontend/src/lib/i18n.js` ajoute les cles FR/AR pour message, discussion, profil utilisateur et suggestions feed.

Tests executes pendant cette session :
- `php artisan route:list` : OK, 102 routes.
- `php artisan test --filter=MessagingApiTest` : OK, 6 tests, 27 assertions.
- `php artisan test --filter=UserControllerTest` : OK, 6 tests, 20 assertions.
- `php artisan test` : OK, 78 tests, 460 assertions.
- `npm.cmd run lint` : OK.
- `npm.cmd run build` : OK.
- `npm.cmd test -- --run` : OK, 11 fichiers, 25 tests.
- `docker compose config` : OK.
- `php artisan migrate:status` depuis Windows : bloque, car `.env` local pointe vers `DB_HOST=mysql`, nom resolvable dans Docker mais pas depuis l'hote Windows.
- `docker ps` : d'abord bloque car Docker Desktop/daemon etait indisponible, puis Docker a ete relance.
- `docker version` : OK apres relance Docker Desktop.
- `docker compose build` : OK apres relance Docker Desktop.

Tests frontend corriges :
- `frontend/src/features/marketplace/marketplaceUtils.test.js` attend maintenant `user=ID`.
- `frontend/src/components/marketplace/MarketplaceCards.test.jsx` verifie les liens de contact via `user=ID`.

Problemes restants / limites de cette session :
- La demande initiale couvre une refonte exhaustive de toutes les pages, traductions et validations manuelles. Cette session a livre le coeur messagerie reelle, contacts `user_id`, feed suggestions, suppression Sync UI, tests backend/frontend verts.
- La structure historique des conversations reste sur `participant_one_id` / `participant_two_id` au lieu d'une nouvelle table pivot `conversation_user`, afin de ne pas casser les donnees et tests existants dans cette passe.
- Le deploiement GitHub/DockerHub/Azure est repris apres relance Docker Desktop.

Nettoyage realise pendant cette session :
- `frontend/dist` supprime apres le build de verification.
- `frontend/coverage` supprime si present.

## 12. Deploiement GitHub DockerHub Azure - 2026-06-17

GitHub :
- Commit cree : `ddef4fd` avec le message `Fix messaging Arabic RTL search feed follow UI and deployment`.
- Push effectue sur `origin/main` : `6ffabbf..ddef4fd`.
- Push effectue aussi sur `origin/safe-ui-audit-fixes` : `6ffabbf..ddef4fd`.
- Les dossiers non suivis `docs/rapport_yazoo_uml/`, `docs/soutenance/`, `scripts/build_rapport_yazoo_uml.py`, `scripts/build_yazoo_soutenance_pptx.py` restent hors commit/deploiement.

Docker local :
- `docker version` : OK, Docker Desktop disponible.
- `docker compose config` : OK.
- `docker compose build` : OK pour backend, queue et frontend.

DockerHub :
- Backend construit et pousse via le script existant :
  - image : `5eef/yazoo-api:latest`
  - digest : `sha256:3e53915d61f7bc9e7ee0c20af09104a879c10aea685d637543f7995c34432a2d`
- Frontend construit et pousse via le script existant :
  - image : `5eef/yazoo-frontend:latest`
  - digest : `sha256:20fe4cbd7741d509b97901a49122e6d96e800fd769fef7b02bcd07d240a722ca`

Azure :
- Ressources existantes utilisees uniquement :
  - Resource group : `yazoo-rg`
  - Backend App Service : `yazoo-api`
  - Frontend App Service : `yazoo`
- Aucune nouvelle ressource Azure creee.
- Backend mis a jour vers `DOCKER|5eef/yazoo-api:latest`.
- Frontend mis a jour vers `DOCKER|5eef/yazoo-frontend:latest`.
- Redemarrage effectue pour `yazoo-api` et `yazoo`.
- Verification Azure CLI :
  - `yazoo-api` : `Running`, host `yazoo-api.azurewebsites.net`, image `DOCKER|5eef/yazoo-api:latest`.
  - `yazoo` : `Running`, host `yazoo.azurewebsites.net`, image `DOCKER|5eef/yazoo-frontend:latest`.

Validation publique :
- `curl.exe -I https://yazoo-api.azurewebsites.net/health/ready` : bloque localement avec `Could not connect to server`.
- `curl.exe -I https://yazoo.azurewebsites.net/` : bloque localement avec `Could not connect to server`.
- `curl.exe -I https://www.microsoft.com` echoue aussi depuis la meme session, ce qui indique une limite reseau locale pour les checks HTTP sortants.
- Les checks finaux accessibles depuis cette session sont donc : configuration Azure CLI, etat App Service `Running`, images Docker correctes, push DockerHub reussi.
