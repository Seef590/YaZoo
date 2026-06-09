# Backend YaZoo

API Laravel 12 pour le feed, le marketplace, les communautes, la messagerie, les notifications et l'administration.

## Installation

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan storage:link
php artisan migrate --seed
```

## Lancement

```powershell
php artisan serve
```

## Commandes utiles

```powershell
php artisan test
php artisan route:list
php artisan migrate:fresh --seed
```

## Environnement

- `.env.example`: configuration locale par defaut
- `.env.mysql.example`: variante orientee MySQL local
- `phpunit.xml`: configuration test avec SQLite in-memory

## Points techniques importants

- Auth Sanctum via cookie httpOnly
- Throttle sur `register` et `login`
- Reservation d animaux et produits protegee par transactions SQL
- Flux media compatible filesystem et MongoDB GridFS
- Notifications stockees en base

## Seeders

`php artisan migrate --seed` cree un jeu de donnees de demonstration couvrant:

- utilisateurs et admin
- posts, commentaires et likes
- animaux et produits
- reservations et facture
- communautes et demandes d adhesion
- messagerie et notifications
