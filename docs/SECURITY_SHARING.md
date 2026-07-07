# YaZoo - Securite de partage local

## Objectif

Ce document decrit comment preparer un paquet local YaZoo partageable avec une commission, un encadrant ou un partenaire institutionnel sans exposer les secrets, les journaux, les sauvegardes ou les dependances lourdes.

Un ZIP local cree pour analyse ponctuelle n'est pas un livrable officiel INDH. Le livrable partageable doit etre regenere depuis le dossier projet reel avec le script controle ci-dessous, afin d'exclure automatiquement les secrets et artefacts locaux.

## Ne jamais inclure

- `.env`, `.env.production` et tout fichier de secret reel.
- `.git` et historique Git local.
- `.github` si le ZIP est destine a une revue non technique.
- `node_modules`, `vendor`, `frontend/dist`, `frontend/coverage`.
- `infra/backups`, snapshots, dumps SQL, `.sql`, `.sql.gz`, `.dump`, `.bak`, `.backup`.
- `backend/storage/logs`, logs applicatifs, cookies de smoke test, fichiers temporaires.
- Volumes Docker, exports de base de donnees et credentials cloud.

Ces elements peuvent contenir des mots de passe, tokens d'acces, historique Git prive, donnees personnelles, traces de production ou fichiers volumineux inutiles. `node_modules`, `vendor`, `coverage` et `.scannerwork` doivent aussi rester hors du ZIP: ils se regenerent depuis les manifestes et peuvent exposer des chemins locaux ou rapports d'analyse non relus.

## Verification rapide avant partage

```powershell
cd "C:\Users\seef7\OneDrive\Desktop\YaZoo"
rg --files -g ".env" -g ".env.*" -g "*.sql" -g "*.sql.gz" -g "*.dump" -g "*.bak" -g "*.backup" -g "*.zip" -g "*.log" -g "*secret*" -g "*token*"
```

La commande ci-dessus sert a reperer les fichiers a exclure. Elle peut afficher des fichiers d'exemple comme `.env.example`; ceux-ci sont acceptables si aucune valeur secrete reelle n'y figure.

## Creation d'un ZIP propre

Executer cette commande depuis PowerShell. Elle cree un dossier temporaire, copie uniquement les fichiers autorises, produit un ZIP, puis inspecte le contenu du ZIP. Si un element interdit est detecte, le script echoue avec le code `1`.

```powershell
cd "C:\Users\seef7\OneDrive\Desktop\YaZoo"
.\deploy\export-indh-clean.ps1
```

Nom genere: `YaZoo_INDH_CLEAN_<yyyy-MM-dd>.zip`, par exemple `YaZoo_INDH_CLEAN_2026-07-01.zip`.

## Controle du ZIP

Apres creation, ouvrir le ZIP et verifier manuellement l'absence de:

- `.env`
- `.git`
- `infra/backups`
- `backend/storage/logs`
- `node_modules`
- `vendor`
- dumps SQL
- fichiers de logs
- credentials cloud

## Decision projet

Pour un dossier INDH, le ZIP doit rester un support de demonstration technique et documentaire. Il ne remplace pas les justificatifs administratifs, la declaration CNDP si applicable, les autorisations ONSSA ou les contrats reels avec les professionnels.

Les documents de verification professionnelle, CIN, ICE, licences, cartes professionnelles et justificatifs similaires ne doivent jamais etre ajoutes a un ZIP de partage. Ils doivent rester dans le stockage prive de l'application ou dans un coffre documentaire controle par le porteur du projet.

## Rotation en cas de partage accidentel

Si un `.env`, un dump SQL, un backup, un log sensible ou un token a ete partage, considerer les secrets comme compromis et les regenerer avant toute poursuite:

- `APP_KEY`
- mot de passe base de donnees
- mot de passe Redis
- identifiants Gmail SMTP
- secret Google OAuth
- token Sonar
- token Docker
- token GitHub
- credentials Azure

En production, stocker les secrets dans Azure App Settings, GitHub Secrets pour CI/CD et, si le niveau de maturite le justifie, Azure Key Vault. Ne pas les stocker dans le depot, les ZIP commission ou les captures d'ecran.

## Presentation commission INDH

Presenter le projet avec une demonstration, des captures, la documentation fonctionnelle et un ZIP propre genere par le script. Les comptes de demonstration doivent utiliser des donnees fictives, sans secrets reels, sans logs de production et sans dumps de donnees personnelles. Les sujets CNDP, ONSSA, paiement CMI et contrats professionnels doivent etre presentes comme des chantiers de validation ou de Phase 2 lorsqu'ils ne sont pas encore finalises.
