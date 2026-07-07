# Social Trust Features

YaZoo affiche uniquement des signaux de confiance issus de donnees backend reelles. Aucun faux avis, faux compteur, faux badge professionnel ou score social simule ne doit etre ajoute cote frontend.

## Donnees disponibles

- Les avis sont lies a une reservation terminee.
- Le backend deduit l'objet evalue depuis `reservations.reservable_type` et `reservations.reservable_id`; le client ne peut pas choisir librement `reviewable_type` ou `reviewable_id`.
- Les agregats item sont autorises uniquement pour les reservations dont le type est fiable: animaux, produits et services.
- Les avis publies peuvent alimenter `averageRating` et `reviewsCount`.
- Les avis masques par moderation ne sont pas comptes dans les moyennes publiques.
- Les favoris sont stockes par utilisateur via une relation polymorphe.
- La verification professionnelle vient de `ProfessionalVerification` et ne doit jamais exposer `document_path`.

## Affichage frontend

- Afficher une note seulement si `reviewsCount > 0` et `averageRating` est non nul.
- Afficher "Aucun avis pour le moment" uniquement comme etat vide, jamais comme une note.
- Afficher "professionnel verifie" seulement si `isProfessionalVerified=true`.
- Afficher "documents en revue" seulement si le statut backend est `pending`.
- Ne jamais afficher "certifie ONSSA", "approuve ONSSA" ou "conforme CNDP officiellement".

## Favoris

Les favoris supportent actuellement:

- `animals`;
- `products`;
- `services`;
- `veterinarians`.

L'API refuse les types PHP bruts comme `App\Models\User`, `Payment` ou `ProfessionalVerification`. Elle est idempotente: enregistrer deux fois la meme annonce ne cree pas de doublon. Le frontend peut afficher `isFavorited`, mais ne doit pas inventer de compteur si `favoritesCount` n'est pas fourni ou fiable.

## Limites

- Les veterinaires peuvent etre ajoutes en favoris, mais les notes veterinaires restent a `null`/`0` tant qu'un workflow de reservation veterinaire fiable n'existe pas.
- Les statistiques avancees comme taux de reponse, ventes realisees ou badges premium ne sont pas disponibles et ne doivent pas etre affichees.
- Les validations CNDP/ONSSA restent juridiques et administratives, a valider par un professionnel competent.
