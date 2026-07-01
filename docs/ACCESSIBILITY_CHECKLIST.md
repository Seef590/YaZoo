# YaZoo - Checklist accessibilite Phase 5

YaZoo vise une amelioration progressive de l'accessibilite numerique. Cette checklist ne constitue pas une certification WCAG officielle.

## Navigation

- [x] Lien d'evitement vers le contenu principal.
- [x] `id="main-content"` sur le contenu principal des layouts ajoutes/verifies.
- [x] Focus visible global.
- [x] Navigation mobile accessible par bouton avec `aria-label`.
- [ ] Audit clavier complet de tous les formulaires avant production.

## Lisibilite

- [x] Textes principaux lisibles en mode clair.
- [x] Textes principaux lisibles en mode sombre.
- [x] Contraste renforce sur pages publiques/admin ajoutees.
- [ ] Mesure de contraste avec outil WCAG dedie.

## Formulaires

- [x] Formulaires principaux avec labels visibles.
- [x] Modales recentes avec titre ou contexte explicite.
- [ ] Audit complet des erreurs formulaire et annonces ARIA.

## Images et icones

- [x] Logo avec alt ou decoration `aria-hidden` selon contexte.
- [x] Boutons icones importants avec `aria-label`.
- [ ] Audit complet des medias utilisateurs avant production.

## Internationalisation

- [x] FR/AR/EN conserves.
- [x] Direction RTL arabe automatique.
- [x] Footer et pages publiques compatibles RTL.
- [ ] Relecture humaine arabe avant depot officiel.

## Mobile

- [x] Layout responsive.
- [x] Prevention overflow horizontal globale.
- [x] Footer flex-wrap.
- [ ] Tests sur vrais appareils Android/iOS.

## Prochaines etapes

- Audit manuel WCAG 2.2 AA.
- Tests lecteur d'ecran.
- Tests clavier sans souris.
- Correction des composants les plus utilises en priorite.
