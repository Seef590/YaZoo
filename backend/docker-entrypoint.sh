#!/bin/sh
set -e

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache

if [ "${YAZOO_RUNTIME_OPTIMIZE:-true}" = "true" ]; then
    php artisan optimize >/dev/null
fi

exec "$@"
