# YaZoo - Notes CNDP / Loi 09-08

## Portee

Ce document decrit la base technique ajoutee pour soutenir une demarche de protection des donnees personnelles au Maroc. Il ne constitue pas une declaration CNDP, une consultation juridique ou une preuve de conformite complete.

## Elements implementes techniquement

- Table `privacy_consents` pour tracer les consentements:
  - cookies necessaires;
  - cookies analytics;
  - SMS OTP;
  - marketing;
  - geolocalisation;
  - CGU;
  - politique de confidentialite.
- Hash de l'adresse IP et du user-agent lorsque ces informations sont disponibles.
- Consentement public possible pour les cookies sans compte utilisateur.
- Consentements authentifies rattaches a l'utilisateur connecte.
- Endpoint d'export JSON des principales donnees utilisateur.
- Exclusion volontaire des messages prives complets de l'export pour eviter d'exposer les donnees d'autres personnes sans strategie formelle.
- Table `data_deletion_requests` pour enregistrer les demandes de suppression sans suppression automatique.
- Blocage des demandes de suppression multiples en statut `pending`.
- Bandeau cookies avec acceptation necessaire, acceptation globale et personnalisation simple.
- Page `/settings/privacy` pour export, consentements et demande de suppression.

## Actions administratives a completer

- Responsable du traitement identifie: Youssef BOUGHIOUL.
- Contact donnees personnelles identifie: youssefboughioul@gmail.com.
- Hebergeur actuel: Microsoft Azure App Service.
- Definir l'adresse administrative, ICE, statut juridique et representant legal.
- Determiner si une declaration, autorisation ou formalite CNDP est requise selon le traitement reel.
- Valider les bases legales, durees de conservation et procedures de reponse aux demandes.
- Rediger une politique de confidentialite finale avec les informations administratives reelles.
- Definir une procedure interne pour traiter les demandes de suppression, rectification, opposition et reclamation.

## Limites actuelles

- Les durees de conservation sont decrites mais pas encore formalisees dans une politique definitive.
- La suppression reelle du compte n'est pas automatique; elle reste manuelle pour proteger l'integrite des reservations, messages, signalements et obligations de securite.
- Les exports ne couvrent pas les messages prives complets.
- L'interface admin complete des demandes privacy est limitee a l'API; le back-office detaille est prevu en phase 4.
- Les placeholders administratifs restants doivent etre remplaces avant toute production reelle: adresse officielle, statut juridique, ICE si disponible et representant legal si distinct.

## Decision projet

YaZoo reste une plateforme de mise en relation responsable, pas un vendeur direct d'animaux. La phase 2 renforce la credibilite technique CNDP/Loi 09-08, mais la conformite finale dependra des informations administratives, des procedures internes et des validations juridiques reelles.
