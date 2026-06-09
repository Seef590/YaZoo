#!/bin/sh
set -e

mkdir -p /var/lib/nginx/tmp /var/log/nginx /run/nginx
chown -R www-data:www-data /var/lib/nginx /var/log/nginx /run/nginx storage bootstrap/cache

if [ "${YAZOO_RUN_MIGRATIONS:-true}" = "true" ]; then
    su-exec www-data php artisan migrate --force
fi

if [ "${YAZOO_RUNTIME_OPTIMIZE:-true}" = "true" ]; then
    su-exec www-data php artisan optimize
fi

php-fpm -D
exec nginx -c /var/www/html/nginx.conf -g "daemon off;"
