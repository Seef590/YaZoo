# YaZoo - Architecture paiement

## Objectif

Cette phase ajoute un socle paiement extensible sans activer de paiement bancaire reel. Les paiements existants `cash_on_pickup` et `bank_transfer` restent compatibles via les champs historiques de `reservations`.

`bank_transfer` reste la valeur historique de `reservations.payment_method`. Dans le nouveau module paiement, ce mode est normalise vers le provider `manual_bank_transfer`. Les deux valeurs ne doivent pas etre confondues: l'une preserve les anciennes reservations, l'autre identifie le nouveau gateway manuel.

## Tables

`payments` stocke l'etat courant d'une tentative de paiement:

- reservation liee, acheteur, vendeur;
- provider: `cash_on_pickup`, `manual_bank_transfer`, `cmi`, `payzone`, `stripe`;
- statut: `pending`, `authorized`, `paid`, `failed`, `refunded`, `cancelled`;
- montant MAD, commission, net vendeur;
- reference interne unique, reference provider, cle d'idempotence;
- URL de checkout si un provider heberge le paiement;
- dates metier et metadata.

`payment_transactions` journalise les evenements:

- initiation;
- callback serveur;
- postauth;
- refund;
- status check;
- update manuel.

Les payloads sont nettoyes avant stockage. Il est interdit de stocker numero de carte, CVV, date d'expiration, PAN ou donnees carte equivalentes. Les champs sensibles comme `token`, `access_token`, `secret`, `password`, `store_key`, `client_secret`, `signature`, `hash` et `authorization` sont egalement masques.

## Gateways

Les providers passent par `PaymentGateway`:

- `supports(string $provider)`;
- `initiate(Payment $payment)`;
- `handleCallback(array $payload)`;
- `refund(Payment $payment, ?float $amount = null)`.

`ManualBankTransferGateway` et `CashOnPickupGateway` ne marquent jamais automatiquement un paiement en `paid`. Le workflow manuel existant reste la source de verite pour finaliser une reservation hors callback bancaire valide.

`CmiGateway` est une preparation technique. Il structure le payload, la signature et la verification, mais ne remplace pas le kit officiel CMI.

## Idempotence

`Idempotency-Key` peut etre envoye dans l'en-tete HTTP ou dans le payload. Si la meme cle est reutilisee pour la meme reservation, le meme paiement est retourne. Si elle est reutilisee pour un autre paiement, la requete est refusee.

Une reservation ne peut pas avoir deux paiements actifs identiques pour le meme provider dans la fenetre `PAYMENT_ACTIVE_TTL_MINUTES`.

## Callback serveur et retour utilisateur

Le callback serveur est l'unique chemin automatique pouvant confirmer un paiement provider. Le retour utilisateur `success` ou `failure` sert seulement a informer l'interface: il ne marque jamais un paiement comme paye. Les routes web `/payment/return/success` et `/payment/return/failure` sont donc des retours sans mutation de statut; elles pourront etre redirigees vers le frontend quand le parcours CMI officiel sera valide.

## Reservation et facture

Le champ historique `reservations.payment_status` passe a `paid` seulement apres callback valide ou action manuelle explicite. La facture existante reste generee par la finalisation de reservation; un simple retour frontend ne cree pas de facture bancaire definitive.

Le montant d'un paiement est calcule a partir du grand total reservation: `total_price + delivery_fee`. Dans le modele actuel, `total_price` represente le sous-total des articles/services et `delivery_fee` est conserve separement.

## Variables principales

- `PAYMENT_DEFAULT_PROVIDER=manual_bank_transfer`
- `PAYMENT_CURRENCY=MAD`
- `PAYMENT_COMMISSION_RATE=0`
- `PAYMENT_ACTIVE_TTL_MINUTES=30`
- `CMI_ENABLED=false`

Les secrets futurs doivent rester dans Azure App Settings, GitHub Secrets ou Azure Key Vault, jamais dans le code ou dans un ZIP partage.
