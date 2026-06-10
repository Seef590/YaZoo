#!/bin/sh
set -e

mkdir -p /var/lib/nginx/tmp /var/log/nginx /run/nginx storage/app

if [ -d /home/site ]; then
    mkdir -p /home/site/yazoo-storage/app/public
    rm -rf storage/app/public
    ln -s /home/site/yazoo-storage/app/public storage/app/public
else
    mkdir -p storage/app/public
fi

chown -R nginx:nginx /var/lib/nginx /var/log/nginx /run/nginx
chown -R www-data:www-data storage bootstrap/cache

if [ -d /home/site/yazoo-storage ]; then
    chown -R www-data:www-data /home/site/yazoo-storage
fi
cp /var/www/html/nginx.conf /etc/nginx/http.d/default.conf

if [ "${YAZOO_RUN_MIGRATIONS:-true}" = "true" ]; then
    su-exec www-data php artisan migrate --force
fi

if [ "${YAZOO_RUNTIME_OPTIMIZE:-true}" = "true" ]; then
    su-exec www-data php artisan optimize
fi

if [ "${YAZOO_RUN_SCHEDULER:-false}" = "true" ]; then
    su-exec www-data php artisan schedule:work &
fi

if [ "${YAZOO_RUN_QUEUE_WORKER:-false}" = "true" ]; then
    su-exec www-data php artisan queue:work "${QUEUE_CONNECTION:-redis}" --sleep="${YAZOO_QUEUE_SLEEP:-1}" --tries="${YAZOO_QUEUE_TRIES:-3}" --backoff="${YAZOO_QUEUE_BACKOFF:-5}" --timeout="${YAZOO_QUEUE_TIMEOUT:-90}" --memory="${YAZOO_QUEUE_MEMORY:-256}" &
fi

php-fpm -D
exec nginx -g "daemon off;"
