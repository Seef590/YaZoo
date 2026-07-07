# YaZoo - Risques et conformite

## Risques juridiques

- Confusion entre plateforme de mise en relation et vendeur direct.
- Annonces animales non conformes.
- Responsabilite utilisateur mal comprise.
- Documents professionnels incomplets.

Mesures: CGU, regles de publication, bannieres legales, signalements, moderation, statuts de revue.

## Risques CNDP

- Donnees personnelles sans base administrative complete.
- Durees de conservation non formalisees.
- Demandes utilisateur non traitees dans les delais.

Mesures: consentements, export, demande suppression, notes CNDP, responsable et contact donnees personnelles identifies. Statut juridique, adresse officielle et ICE restent a completer.

Phase 3A ajoute une configuration legal centralisee (`backend/config/legal.php`) et une procedure privacy documentee dans `docs/CNDP_PRIVACY_READINESS.md`. Ces elements restent a valider par un professionnel juridique/comptable avant toute presentation comme conformite CNDP officielle.

## Risques ONSSA

- Numero ONSSA/licence non verifie.
- Professionnel presente comme certifie officiellement.
- Annonce sensible publiee trop vite.

Mesures: formulation prudente, verification interne, statut pending review, suspension admin, notes ONSSA.

Phase 3A renforce les formulations publiques: documents declares, documents en cours de revue, documents verifies par YaZoo, non verifie ou refuse. YaZoo ne doit pas etre presente comme organisme de certification ONSSA.

## Risques cybersecurite

- Secrets partages par erreur.
- Exports contenant trop de donnees.
- Actions admin non tracees.
- Donnees documentaires sensibles mal stockees.

Mesures: documentation de partage, exports limites, moderation_actions, hash IP/user-agent, stockage documentaire prive pour les documents de verification professionnelle.

## Risques operationnels

- Moderation insuffisante.
- Support utilisateur trop lent.
- Donnees de test melangees a des donnees reelles.
- Absence de plan de restauration.

Mesures: checklist production, exports CSV, procedures admin, tests automatises.

## Accompagnement necessaire

- Conseil juridique local.
- Avis CNDP si applicable.
- Avis ONSSA/professionnels selon activite reelle.
- Conseil comptable et choix du statut.
- Audit securite avant production.
