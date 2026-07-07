# Reviews And Ratings Policy

Cette politique de preparation de production fixe les regles minimales pour les avis YaZoo.

## Regles metier

- Un avis doit etre lie a une reservation reelle.
- La reservation doit etre `completed`.
- Le reviewer doit etre participant a la reservation.
- Un utilisateur ne peut pas s'auto-evaluer.
- Un seul avis par utilisateur et par reservation est autorise.
- La note doit etre comprise entre 1 et 5.
- Le client ne peut pas forcer l'objet evalue: `reviewable_type` et `reviewable_id` sont deduits de la reservation.
- Si le type reserve ne fait pas partie des types supportes pour agregat item, l'avis reste rattache au vendeur/reviewee sans alimenter une moyenne d'annonce.
- Aucun avis fictif ne doit etre seede en production.

## Moderation

Les statuts disponibles sont:

- `published`: avis visible et compte dans les moyennes publiques.
- `pending_moderation`: avis en attente de revue.
- `hidden`: avis masque et exclu des moyennes publiques.
- `reported`: avis signale.

Les actions admin doivent preferer le masquage ou la restauration plutot que la suppression definitive, afin de garder une trace de moderation.

## Calcul des moyennes

Les ressources marketplace exposent:

- `averageRating`: moyenne des avis publies, ou `null` sans avis publie.
- `reviewsCount`: nombre d'avis publies.

Les avis masques, signales ou en attente de moderation ne doivent pas alimenter les moyennes publiques.

Types supportes pour les agregats item:

- `Animal`;
- `Product`;
- `ServiceListing`.

Les veterinaires ne doivent pas recevoir de moyenne publique tant qu'une reservation veterinaire fiable n'est pas implementee.

## Difference avec les certifications officielles

Une verification YaZoo signifie une revue interne des documents fournis. Elle ne vaut pas certification ONSSA, validation CNDP officielle, garantie d'Etat, ni avis veterinaire.

Toute communication publique doit rester prudente: "documents declares", "documents en revue", "documents verifies par YaZoo", "non verifie", "refuse".
