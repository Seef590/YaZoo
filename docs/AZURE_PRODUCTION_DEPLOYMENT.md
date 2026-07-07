# YaZoo Azure Production Deployment

## Architecture cible

- Backend: Azure App Service Linux custom container, image `yazoo-api`, port interne `8080`.
- Frontend: Azure Static Web Apps, build Vite depuis `frontend/dist`.
- Database: Azure Database for MySQL Flexible Server, TLS active.
- Cache, sessions, queues: Azure Cache for Redis, TLS port `6380`.
- CI/CD: GitHub Actions `.github/workflows/ci.yml` et `.github/workflows/deploy.yml`.

## GitHub Secrets requis

- `AZURE_CREDENTIALS`: JSON du service principal Azure.
- `AZURE_RESOURCE_GROUP`: groupe de ressources Azure.
- `AZURE_WEBAPP_NAME`: nom de l'App Service backend.
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: token de deploiement Static Web Apps.
- `ACR_NAME`: nom Azure Container Registry sans suffixe.
- `ACR_LOGIN_SERVER`: serveur ACR, par exemple `yazooacr.azurecr.io`.
- `DOCKERHUB_USERNAME`: optionnel, si l'image backend est publiee sur Docker Hub.
- `DOCKERHUB_TOKEN`: optionnel, token Docker Hub si Docker Hub remplace ACR.
- `SONAR_TOKEN`: optionnel, uniquement si SonarCloud est utilise.

## GitHub Variables frontend

- `VITE_API_URL=https://<azure-webapp-name>.azurewebsites.net/api`
- `VITE_STORAGE_URL=https://<azure-webapp-name>.azurewebsites.net/storage`
- `VITE_REALTIME_ENABLED=false`
- `VITE_REVERB_APP_KEY=`
- `VITE_REVERB_HOST=<azure-webapp-name>.azurewebsites.net`
- `VITE_REVERB_PORT=443`
- `VITE_REVERB_SCHEME=https`
- `VITE_MONITORING_ENABLED=false`
- `VITE_MONITORING_ENDPOINT=https://<azure-webapp-name>.azurewebsites.net/api/monitoring/frontend-error`
- `VITE_NOTIFICATIONS_POLL_MS=30000`
- `VITE_BUILD_SOURCEMAPS=false`
- `SONAR_ORGANIZATION`: optionnel.

## App Settings Azure backend

Configurer ces valeurs dans App Service > Configuration > Application settings.

- `WEBSITES_PORT=8080`
- `WEBSITES_CONTAINER_START_TIME_LIMIT=1800`
- `WEBSITE_HEALTHCHECK_MAXPINGFAILURES=3`
- `YAZOO_RUN_MIGRATIONS=true`
- `YAZOO_RUNTIME_OPTIMIZE=true`
- `YAZOO_RUN_SCHEDULER=false`
- `YAZOO_RUN_QUEUE_WORKER=false`
- `APP_NAME=YaZoo`
- `APP_ENV=production`
- `APP_KEY=<php artisan key:generate --show>`
- `APP_DEBUG=false`
- `APP_URL=https://<azure-webapp-name>.azurewebsites.net`
- `APP_FORCE_HTTPS=true`
- `ADMIN_BOOTSTRAP_ENABLED=false`
- `LOG_CHANNEL=stack`
- `LOG_STACK=stderr`
- `LOG_LEVEL=info`
- `DB_CONNECTION=mysql`
- `DB_HOST=<mysql-server-name>.mysql.database.azure.com`
- `DB_PORT=3306`
- `DB_DATABASE=yazoo`
- `DB_USERNAME=<mysql-admin-user>`
- `DB_PASSWORD=<mysql-password>`
- `MYSQL_ATTR_SSL_CA=/etc/ssl/certs/ca-certificates.crt`
- `CACHE_STORE=redis`
- `QUEUE_CONNECTION=redis`
- `SESSION_DRIVER=redis`
- `SESSION_CONNECTION=default`
- `SESSION_ENCRYPT=true`
- `SESSION_SECURE_COOKIE=true`
- `SESSION_SAME_SITE=none`
- `SESSION_DOMAIN=null`
- `REDIS_CLIENT=phpredis`
- `REDIS_SCHEME=tls`
- `REDIS_HOST=<redis-name>.redis.cache.windows.net`
- `REDIS_PORT=6380`
- `REDIS_PASSWORD=<redis-access-key>`
- `REDIS_DB=0`
- `REDIS_CACHE_DB=1`
- `FRONTEND_URL=https://<static-web-app-name>.azurestaticapps.net`
- `SANCTUM_STATEFUL_DOMAINS=<static-web-app-name>.azurestaticapps.net`
- `CORS_ALLOWED_ORIGINS=https://<static-web-app-name>.azurestaticapps.net`
- `FILESYSTEM_DISK=public`
- `MEDIA_STORAGE_DRIVER=filesystem`
- `MEDIA_MONGODB_ENABLED=false`
- `MEDIA_MONGODB_URI=`
- `MAIL_MAILER=log`

Phase 1 conserve `MEDIA_STORAGE_DRIVER=filesystem` pour ne pas casser les uploads existants. Ce mode doit etre accompagne d'une strategie de persistance/backup; le stockage local d'un App Service container n'est pas une solution durable pour les redeploiements, la scalabilite ou la haute disponibilite. Ne jamais utiliser `mongodb://127.0.0.1:27017` en production Azure. MongoDB media reste optionnel/dev tant qu'un service gere et une strategie d'exploitation ne sont pas explicitement configures. Azure Blob Storage est une cible future, non activee dans cette phase.

## Commandes Azure

```powershell
az login
az group create --name <resource-group> --location <region>
az acr create --resource-group <resource-group> --name <acr-name> --sku Basic
az appservice plan create --resource-group <resource-group> --name <plan-name> --is-linux --sku B1
az webapp create --resource-group <resource-group> --plan <plan-name> --name <azure-webapp-name> --deployment-container-image-name <acr-login-server>/yazoo-api:latest
az webapp identity assign --resource-group <resource-group> --name <azure-webapp-name>
az role assignment create --assignee <webapp-principal-id> --scope <acr-resource-id> --role AcrPull
az webapp config set --resource-group <resource-group> --name <azure-webapp-name> --generic-configurations '{"healthCheckPath":"/health/ready","acrUseManagedIdentityCreds":true}'
az webapp config appsettings set --resource-group <resource-group> --name <azure-webapp-name> --settings WEBSITES_PORT=8080 WEBSITES_CONTAINER_START_TIME_LIMIT=1800 WEBSITE_HEALTHCHECK_MAXPINGFAILURES=3 YAZOO_RUN_MIGRATIONS=true YAZOO_RUNTIME_OPTIMIZE=true
az staticwebapp create --resource-group <resource-group> --name <static-web-app-name> --source https://github.com/<owner>/<repo> --branch main --app-location frontend --output-location dist --login-with-github
```

Ajouter ensuite toutes les variables backend listees plus haut avec:

```powershell
az webapp config appsettings set --resource-group <resource-group> --name <azure-webapp-name> --settings KEY=value
```

## Build et push manuel d'image

Depuis la racine du projet:

```powershell
cd C:\Users\seef7\OneDrive\Desktop\YaZoo
.\deploy\quick-build-push.ps1 -Registry acr -ResourceGroup <resource-group> -AcrName <acr-name> -Tag latest
```

Pour Docker Hub:

```powershell
cd C:\Users\seef7\OneDrive\Desktop\YaZoo
.\deploy\quick-build-push.ps1 -Registry dockerhub -DockerHubUser <dockerhub-user> -DockerHubRepository yazoo-api -Tag latest
```

Image Docker Hub obtenue:

```text
<dockerhub-user>/yazoo-api:latest
```

Pour utiliser Docker Hub dans Azure App Service au lieu d'ACR:

```powershell
az webapp config container set --resource-group <resource-group> --name <azure-webapp-name> --docker-custom-image-name <dockerhub-user>/yazoo-api:latest --docker-registry-server-url https://index.docker.io
```

Si le repository Docker Hub est prive, ajouter aussi les App Settings de registre via le portail Azure ou Azure CLI.

Deploiement backend Azure App Service depuis l'image Docker Hub publique:

```powershell
cd C:\Users\seef7\OneDrive\Desktop\YaZoo
$appKey = cd backend; php artisan key:generate --show; cd ..
.\deploy\azure-dockerhub-deploy.ps1 `
  -ResourceGroup yazoo-rg `
  -Location germanywestcentral `
  -WebAppName yazoo-api `
  -DockerHubImage 5eef/yazoo-api:latest `
  -AppKey $appKey `
  -FrontendUrl https://<static-web-app-name>.azurestaticapps.net `
  -DbHost <mysql-server-name>.mysql.database.azure.com `
  -DbUsername <mysql-admin-user> `
  -DbPassword <mysql-password> `
  -RedisHost <redis-name>.redis.cache.windows.net `
  -RedisPassword <redis-access-key>
```

## Ports locaux Docker

Les ports attendus en local sont:

- Frontend: `http://127.0.0.1:4173`
- Backend API via nginx: `http://127.0.0.1:8000`
- MySQL local: `127.0.0.1:3307`
- Redis local: `127.0.0.1:6379`
- SonarQube local: `http://127.0.0.1:9000`

Si des conteneurs d'un ancien projet `yazoo_v2` occupent les ports, les arreter avant de lancer la stack courante:

```powershell
docker compose -p yazoo_v2 down
docker compose up -d --build
```

## Commandes Git locales

```powershell
cd C:\Users\seef7\OneDrive\Desktop\YaZoo
git init
git add .
git commit -m "Prepare YaZoo for Azure production deployment"
git branch -M main
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

## Rotation des secrets

Les anciens secrets locaux doivent etre consideres compromis s'ils ont deja ete versionnes ou partages. Regenerer au minimum `APP_KEY`, `DB_PASSWORD`, `DB_ROOT_PASSWORD`, `REDIS_PASSWORD`, `JWT_SECRET`, `SONAR_TOKEN` et les cles tierces.
