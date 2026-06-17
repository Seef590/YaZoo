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
- `php artisan route:list` : OK, 97 routes.
- `php artisan migrate:status` : bloque hors Docker, `Host mysql failed` car l'hote `mysql` n'est resolu que dans le reseau Compose.
- `php artisan test tests\Feature\Reservation\ReservationApiTest.php` : OK, 10 tests, 92 assertions.
- `php artisan test` : OK, 76 tests, 453 assertions.

Docker :
- `docker compose config` : OK.
- `docker compose build` non execute pour eviter un build long non necessaire apres validation config/build applicatif.

## 8. Problemes restants

- Le chantier demande une traduction exhaustive de toutes les pages existantes. Cette tranche corrige le socle i18n, Contact, services et les cles critiques testees, mais il reste des textes hardcodes historiques dans plusieurs pages existantes.
- Le feed organique des services expose un endpoint backend `GET /api/services/feed`, mais l'insertion visuelle dans `FeedPage` n'a pas ete finalisee dans cette tranche.
- Les actions feed/communautes/profil/admin ne sont pas encore toutes connectees a `ActivityLogger`; le service central est en place.
- Les routes admin services/reservations dediees ne sont pas encore ajoutees; l'admin peut agir via policies sur reservations, mais pas via un dashboard services separe.
