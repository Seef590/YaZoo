# YaZoo - Preparation integration CMI

## Statut actuel

CMI est desactive par defaut avec `CMI_ENABLED=false`. La Phase 2 ne constitue pas une integration CMI certifiee et ne doit pas etre presentee comme un paiement bancaire en production.

Quand CMI est desactive, l'initiation et le callback sont refuses. Un callback CMI ne peut donc pas marquer un paiement `paid` si `CMI_ENABLED=false`.

## Variables futures

- `CMI_ENABLED=false`
- `CMI_MODE=sandbox`
- `CMI_GATEWAY_URL=`
- `CMI_CLIENT_ID=`
- `CMI_STORE_KEY=`
- `CMI_OK_URL=`
- `CMI_FAIL_URL=`
- `CMI_CALLBACK_URL=`

Aucune valeur reelle ne doit etre versionnee. En production, utiliser Azure App Settings ou Azure Key Vault.

L'initiation CMI echoue explicitement si une configuration minimale manque: `CMI_GATEWAY_URL`, `CMI_CLIENT_ID`, `CMI_STORE_KEY`, `CMI_OK_URL`, `CMI_FAIL_URL` ou `CMI_CALLBACK_URL`. L'API de configuration frontend garde aussi CMI masque tant que ces champs ne sont pas complets.

## Donnees interdites

YaZoo ne doit jamais stocker:

- numero de carte bancaire;
- CVV/CVC;
- date d'expiration;
- PAN;
- piste magnetique;
- donnees carte brutes ou token carte non necessaire.

Les payloads callback sont masques defensivement avant stockage dans `payment_transactions`.

Le masquage couvre aussi les tokens, secrets, mots de passe, cles marchand, signatures, hash et en-tetes d'autorisation. La verification de signature se fait sur le payload brut recu, puis seule la version nettoyee est journalisee.

## Callback vs retour utilisateur

`ok_url` et `fail_url` sont des retours navigateur. Ils ne prouvent pas le paiement. Seul le callback serveur signe, verifie et journalise peut faire passer un paiement en `paid`.

## Signature

Le code contient des methodes isolees:

- `buildHostedCheckoutPayload`;
- `generateSignature`;
- `verifySignature`;
- `sanitizePayload`.

La signature actuelle est une structure preparatoire testable. Elle devra etre remplacee ou validee strictement avec le kit officiel CMI, ses champs exacts, son ordre de hash, son encodage et ses contraintes de sandbox.

## Etapes avant production

1. Obtenir le kit officiel CMI et la documentation marchand.
2. Remplacer la logique preparatoire par les champs et hash officiels.
3. Tester sandbox: initiation, retour success/failure, callback valide, callback invalide, double callback, timeout, annulation.
4. Verifier idempotence, logs, absence de donnees carte et alerting.
5. Faire une revue securite PCI-DSS et une validation juridique/contractuelle.
6. Activer `CMI_ENABLED=true` uniquement apres recette complete.
