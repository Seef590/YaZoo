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
- `YAZOO_RUN_MIGRATIONS=true`
- `YAZOO_RUNTIME_OPTIMIZE=true`
- `APP_NAME=YaZoo`
- `APP_ENV=production`
- `APP_KEY=<php artisan key:generate --show>`
- `APP_DEBUG=false`
- `APP_URL=https://<azure-webapp-name>.azurewebsites.net`
- `APP_FORCE_HTTPS=true`
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
- `MAIL_MAILER=log`

## Commandes Azure

```powershell
az login
az group create --name <resource-group> --location <region>
az acr create --resource-group <resource-group> --name <acr-name> --sku Basic
az appservice plan create --resource-group <resource-group> --name <plan-name> --is-linux --sku B1
az webapp create --resource-group <resource-group> --plan <plan-name> --name <azure-webapp-name> --deployment-container-image-name <acr-login-server>/yazoo-api:latest
az webapp config appsettings set --resource-group <resource-group> --name <azure-webapp-name> --settings WEBSITES_PORT=8080 YAZOO_RUN_MIGRATIONS=true YAZOO_RUNTIME_OPTIMIZE=true
az staticwebapp create --resource-group <resource-group> --name <static-web-app-name> --source https://github.com/<owner>/<repo> --branch main --app-location frontend --output-location dist --login-with-github
```

Ajouter ensuite toutes les variables backend listees plus haut avec:

```powershell
az webapp config appsettings set --resource-group <resource-group> --name <azure-webapp-name> --settings KEY=value
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
