# AUDIT I18N UI MOBILE YAZOO

Date: 2026-07-01T00:46:09.881Z

## Fichiers audites

- 134 fichiers frontend dans frontend/src
- backend/app/Http, backend/lang et routes API audites manuellement pendant la correction

## Domaines i18n verifies

- common
- nav
- auth
- feed
- comments
- stories
- story
- marketplace
- animals
- products
- services
- communities
- messages
- reservations
- notifications
- profile
- admin
- contact
- validation
- errors
- statuses

## Cles utilisees

- 1024 cles t(...) detectees
- 23 cles dynamiques detectees

## Domaines sans cle detectee

- nav
- stories
- validation
- statuses

## Cles potentiellement manquantes

- admin.moderation.actions.${action}
- adminStats.labels.${key}
- adminUsers.actions.${modal.action}
- compliance.badges.${type}
- messages.dropdown.${tab}
- moderationActions.actions.${action.action}
- notifications.tabs.${filter}
- notifications.tabs.${tab}
- privacy.settings.consentDescriptions.${type}
- privacy.settings.consentLabels.${type}
- privacy.settings.rights.${item}
- privacy.settings.statuses.${deletionRequests[0]?.status ?? 
- professionalVerification.businessTypes.${item.businessType}
- professionalVerification.businessTypes.${type}
- professionalVerification.businessTypes.${verification.businessType}
- professionalVerification.statuses.${status}
- reports.reasons.${item}
- reports.reasons.${report.reason}
- reports.statuses.${status}
- reports.types.${report.reportableType}
- search.tabs.${key}
- search.tabs.${tab}
- services.priceTypes.${service.priceType}

## Textes statiques suspects

- Aucun texte suspect detecte

## Corrections couvertes

- Langues stabilisees sur fr/ar/en.
- Accept-Language envoye par les clients Axios frontend.
- Backend Laravel limite a fr/ar/en avec fallback fr.
- Marketplace mobile: menu Animaux / Produits / Services conserve et rendu scrollable localement.
- PostCard: image pleine largeur du parent avec padding controle, menu trois points et RTL ameliores.
- Bottom navigation: padding bas avec safe-area pour eviter le recouvrement.
