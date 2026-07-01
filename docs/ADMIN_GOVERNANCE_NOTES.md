# YaZoo - Notes de gouvernance admin Phase 4

## Objectif

La Phase 4 renforce le back-office YaZoo pour un usage institutionnel et un dossier INDH: moderation tracable, suspension sans suppression, gestion des utilisateurs, exports CSV et journalisation des actions sensibles.

YaZoo reste une plateforme marocaine de mise en relation responsable. Les outils admin servent a reduire les risques, documenter les decisions et proteger les utilisateurs, sans remplacer les autorites publiques.

## Workflow admin

- Les routes admin Phase 4 utilisent un middleware admin centralise.
- Les actions sensibles creent une entree dans `moderation_actions`.
- Les utilisateurs et contenus ne sont pas supprimes par defaut: la suspension, le masquage ou la restauration sont privilegies.
- Les raisons de suspension, ban ou moderation doivent etre documentees.

## Suspension sans suppression

Les utilisateurs peuvent etre:

- actifs;
- suspendus temporairement;
- bannis.

Les contenus peuvent etre:

- actifs;
- masques;
- suspendus;
- restaures.

Pour les annonces animales, le statut legal existant reste prioritaire. Une suspension admin met l'annonce en `suspended`; une restauration remet l'annonce en statut approuve si le contexte le permet.

## Historique `moderation_actions`

Chaque entree contient:

- l'admin ayant effectue l'action;
- l'action;
- le type et l'identifiant de la cible;
- une raison optionnelle;
- des metadonnees non sensibles;
- un hash de l'IP et du user-agent si disponibles.

Les IP et user-agents ne sont pas stockes en clair.

## Exports CSV

Les exports Phase 4 couvrent:

- statistiques globales;
- signalements;
- historique de moderation;
- verifications professionnelles.

Les exports excluent les secrets, mots de passe, tokens et donnees techniques sensibles.

## Coherence Docker/code local

La Phase 3 avait applique des migrations dans le conteneur car le backend Docker local ne montait pas tout le code applicatif local. En Phase 4, l'objectif est de verifier cette coherence et, si necessaire, de reconstruire localement l'image backend avec le code courant avant d'appliquer les migrations dans Docker.

Aucune image DockerHub ne doit etre poussee. Aucun volume Docker ne doit etre supprime.

## Limites restantes

- Le workflow complet de validation juridique et documentaire reste manuel.
- La journalisation doit etre completee en production avec une politique de retention.
- Les exports CSV devront etre limites par periode et roles en production.
- La suspension des utilisateurs est appliquee prudemment aux routes d'ecriture principales, sans bloquer l'authentification ni l'acces au profil.

## Apport INDH

Ces ajouts montrent que YaZoo peut etre gere comme une plateforme responsable: decisions admin tracables, moderation proportionnee, preservation des preuves et absence de suppression destructive par defaut.
