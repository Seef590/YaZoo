# YaZoo - Roadmap INDH locale

## 1. Objectif INDH

YaZoo vise a devenir une plateforme marocaine de mise en relation responsable autour de l'adoption animale, des services animaliers et des professionnels locaux. Le projet est positionne comme une initiative sociale et economique pour soutenir l'adoption responsable, la visibilite des professionnels locaux, la moderation des contenus, la securite des utilisateurs et l'inclusion numerique.

YaZoo n'est pas un vendeur direct d'animaux. Le dossier INDH doit presenter YaZoo comme une plateforme d'intermediation, avec des limites claires tant que les pieces administratives CNDP, ONSSA, fiscales et juridiques reelles ne sont pas fournies.

## 2. Fonctionnalites deja presentes

- Backend Laravel 12 et API REST.
- Frontend React 19, Vite et Tailwind CSS.
- Docker Compose local avec MySQL et Redis.
- Authentification email/OTP, OTP SMS, OAuth Google et session Sanctum.
- Profils publics, avatars, bio, ville, pays et indicateurs de confiance.
- Feed social avec posts, medias, reactions, commentaires, stories et visibilite.
- Marketplace animaux, produits, services et veterinaires.
- Messagerie, conversations privees et notifications.
- Follow, communautes et reservations.
- Recherche globale avec utilisateurs, communautes, annonces et posts.
- Admin moderation, admin commandes et admin statistiques.
- Signalements pour animals, products, services, veterinarians et posts.
- Pages legales/pro publiques et footer complet.
- i18n FR/AR/EN, RTL arabe et dark mode.
- Champs de securite sur annonces animales: telephone de contact et acceptation des regles.

## 3. Risques critiques restants

- Conformite CNDP / Loi 09-08 encore incomplete: consentements, export, demandes de suppression et registre documentaire a renforcer.
- Conformite ONSSA et verification professionnelle encore incomplete: documents, statuts, moderation specialisee et badges fiables.
- Back-office institutionnel encore a completer: suspensions, historique des actions, exports CSV et gouvernance admin.
- Documentation INDH finale, accessibilite, SEO et PWA encore a finaliser.
- Des fichiers locaux sensibles ou volumineux existent dans l'environnement de travail et doivent etre exclus de tout partage: `.env`, `.git`, `node_modules`, `vendor`, `infra/backups`, `backend/storage/logs`, dumps SQL, logs et artefacts de build.

## 4. Phases de travail

### Phase 1 - Nettoyage securite et conformite documentaire minimale

Statut: terminee.

Objectif: securiser le partage local du projet, documenter les exclusions, renforcer les pages legales publiques et clarifier le positionnement INDH/CNDP minimal.

### Phase 2 - CNDP / Loi 09-08

Statut: non demarree.

Objectif: consentements, export utilisateur, demande de suppression, cookies et preferences privacy.

### Phase 3 - ONSSA / annonces animales / professionnels

Statut: non demarree.

Objectif: verification professionnelle, champs de conformite animale, statuts de revision et badges fiables.

### Phase 4 - Admin gouvernemental

Statut: non demarree.

Objectif: moderation actions, suspensions, exports CSV, historique admin et middleware admin consolide.

### Phase 5 - PWA, accessibilite, SEO, dossier INDH final

Statut: non demarree.

Objectif: PWA, SEO, accessibilite, documentation INDH finale et checklists de production.

## 5. Fichiers modifies par phase

### Phase 1

- `docs/INDH_ROADMAP_YAZOO.md` cree pour memoriser le travail local.
- `docs/README_COMMISSION.md` cree pour presenter YaZoo a une commission INDH.
- `docs/SECURITY_SHARING.md` cree avec consignes de partage et commande PowerShell de ZIP propre.
- `.env.example` enrichi avec avertissement local sans secrets.
- `backend/.env.example` clarifie pour Windows local (`127.0.0.1:3307`) et Docker (`mysql:3306`).
- `frontend/.env.example` enrichi avec avertissement local sans secrets.
- `frontend/src/pages/PrivacyPage.jsx` enrichi avec sections CNDP minimales.
- `frontend/src/pages/TermsPage.jsx` enrichi avec intermediation, non vente directe et reclamations.
- `frontend/src/pages/PublishingRulesPage.jsx` enrichi avec responsabilite publieur, professionnels et signalement.
- `frontend/src/pages/AboutPage.jsx` enrichi avec impact social, mentions legales et contact donnees personnelles.
- `frontend/src/lib/i18n.js` enrichi avec nouvelles chaines FR/AR/EN.
- `AUDIT_I18N_UI_MOBILE_YAZOO.md` regenere par l'audit i18n.

## 6. Migrations creees

### Phase 1

Aucune migration creee ou appliquee.

## 7. Tests executes

### Phase 1

- `npm run lint` dans `frontend`: OK.
- `npm test -- --run` dans `frontend`: OK, 11 fichiers, 26 tests.
- `npm run build` dans `frontend`: OK.
- `node scripts/audit-i18n.mjs`: OK, 881 cles detectees, 0 texte statique suspect.

## 8. Points non termines

- Ne pas demarrer la phase 2 avant rapport de fin de phase 1.
- Completer les phases 2 a 5 apres validation.
- Remplacer les placeholders `[A completer]` par les informations administratives reelles avant production ou depot officiel.
- Finaliser les procedures CNDP, ONSSA, moderation institutionnelle, PWA, SEO, accessibilite et dossier INDH complet dans les phases suivantes.

## 9. Decisions prises

- Travail strictement local dans `C:\Users\seef7\OneDrive\Desktop\YaZoo`.
- Aucune modification de `.github`, `deploy/*.ps1`, `.env`, `.env.production`, secrets ou parametres production.
- Aucun `migrate:fresh`, `migrate:refresh`, `migrate:reset`.
- Aucun fichier local sensible ou backup ne sera supprime pendant cette phase.
- Les pages legales existantes seront enrichies via le systeme i18n et `PublicPageShell`, sans reconstruire l'architecture.
- La page `/about` porte les mentions legales placeholders; aucune route `/legal-notice` separee n'a ete ajoutee en phase 1.
- Le scan local a confirme la presence de sauvegardes et logs a exclure du partage: `infra/backups`, `backend/storage/logs`, fichiers `.sql.gz`, `.zip`, `.log`.

## 10. Confirmation de securite locale

- Aucun deploiement Azure effectue.
- Aucun push GitHub effectue.
- Aucune image DockerHub poussee.
- Aucun secret modifie.
- Aucune donnee supprimee.
