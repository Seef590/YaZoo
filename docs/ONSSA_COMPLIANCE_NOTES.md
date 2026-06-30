# YaZoo - Notes ONSSA et verification professionnelle

## Positionnement

YaZoo est une plateforme marocaine de mise en relation responsable autour de l'adoption animale, des services animaliers et des professionnels locaux. YaZoo n'est pas vendeur direct d'animaux et ne remplace pas l'ONSSA, les veterinaires, les autorites locales ou toute administration competente.

Ces notes servent a presenter la base technique Phase 3 dans un dossier INDH sans affirmer une conformite administrative totale tant que les pieces reelles ne sont pas fournies et verifiees.

## Ce qui est implemente techniquement

- Champ `seller_type` sur les annonces animaux: particulier, professionnel ou association/refuge.
- Champs d'information de conformite sur les annonces animaux: origine, numero d'identification, references documentaires, numero ONSSA/licence a verifier.
- Statut de revue animale: brouillon, en attente de revision, approuvee, rejetee ou suspendue.
- Interface admin dediee pour changer le statut de revue et ajouter une note de moderation.
- Systeme de demande de verification professionnelle pour veterinaires, animaleries, eleveurs, refuges, prestataires, associations et autres.
- Interface admin pour approuver ou rejeter une demande de verification professionnelle.
- Badges publics prudents: telephone verifie, professionnel verifie par YaZoo, documents en cours de verification, annonce en revision, annonce approuvee par moderation YaZoo, numero ONSSA renseigne.
- Pages de regles enrichies avec les obligations des particuliers, professionnels et associations.

## Limites actuelles

- YaZoo ne verifie pas encore automatiquement l'authenticite des documents.
- Les champs documentaires sont des references texte; un stockage prive renforce des documents devra etre finalise avant production publique.
- Une verification professionnelle approuvee par YaZoo n'est pas une certification officielle ONSSA.
- Les statuts de revue admin ne remplacent pas une decision administrative.
- Aucun paiement en ligne ni transfert de propriete n'est gere par YaZoo dans cette phase.

## Actions administratives reelles a preparer

- Identifier le responsable legal du projet.
- Definir la procedure interne de controle documentaire.
- Preparer les modeles de justificatifs acceptes par type d'activite.
- Clarifier les cas ou un numero ONSSA, une licence professionnelle ou un document veterinaire est requis.
- Mettre en place une procedure de contact avec les autorites competentes si un contenu semble illegal ou dangereux.
- Former les moderateurs aux decisions prudentes: approuver, rejeter, suspendre, demander un complement.

## Presentation recommandee pour le dossier INDH

Formulation recommandee:

- "YaZoo collecte des informations de conformite et permet une verification documentaire interne des professionnels."
- "Les annonces animales sensibles sont marquees en attente de revision et peuvent etre suspendues par moderation."
- "YaZoo n'est pas vendeur direct d'animaux et ne se substitue pas aux autorites competentes."
- "La verification YaZoo est une mesure de confiance et de moderation, pas une certification officielle."

Formulations a eviter:

- "YaZoo est conforme ONSSA."
- "YaZoo certifie officiellement les professionnels."
- "YaZoo garantit la legalite de chaque annonce."
- "YaZoo remplace le controle veterinaire ou administratif."

## Avant production publique

- Ajouter stockage prive chiffre ou equivalent pour les documents sensibles.
- Ajouter historique complet des actions admin en Phase 4.
- Ajouter exports CSV et journal de moderation.
- Rediger une procedure de conservation et suppression des documents professionnels.
- Faire valider les textes juridiques par un conseil local competent.
- Completer les placeholders administratifs reels dans les pages legales et documents INDH.
