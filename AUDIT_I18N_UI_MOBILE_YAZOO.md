# AUDIT I18N UI MOBILE YAZOO

Date: 2026-06-20T01:13:51.527Z

## Fichiers audites

- 96 fichiers frontend dans frontend/src
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

- 522 cles t(...) detectees
- 1 cles dynamiques detectees

## Domaines sans cle detectee

- nav
- stories
- validation
- statuses

## Cles potentiellement manquantes

- services.priceTypes.${service.priceType}

## Textes statiques suspects

- frontend\src\pages\ContactPage.jsx: votre@email.com
- frontend\src\pages\FeedbackPage.jsx: vous@exemple.com
- frontend\src\pages\LoginPage.jsx: vous@exemple.com
- frontend\src\pages\MessagesPage.jsx: contact@yazoo.ma
- frontend\src\pages\RegisterPage.jsx: vous@exemple.com

## Corrections couvertes

- Langues stabilisees sur fr/ar/en.
- Accept-Language envoye par les clients Axios frontend.
- Backend Laravel limite a fr/ar/en avec fallback fr.
- Marketplace mobile: menu Animaux / Produits / Services conserve et rendu scrollable localement.
- PostCard: image pleine largeur du parent avec padding controle, menu trois points et RTL ameliores.
- Bottom navigation: padding bas avec safe-area pour eviter le recouvrement.
