# YaZoo V2 Production Scaling Plan

## Runtime Topology

- Web traffic terminates at a managed load balancer with HTTPS, HTTP/2, health checks on `/up`, and sticky sessions disabled.
- Laravel API runs as stateless PHP-FPM containers behind Nginx. Authentication remains cookie based, but state is stored in the database/cache, not local disk.
- Queue workers run separately from web containers for notifications, messaging fan-out, media backup, and future image processing.
- Vite assets are built once, uploaded to object storage, and served through a CDN with immutable cache headers.

## Database

- Primary database handles writes. Read replicas serve dashboards, feeds, marketplace browse traffic, and reporting once traffic justifies the split.
- Hot query indexes are defined for marketplace filters, feed ordering, conversations, notifications, reservations, and moderation dashboards.
- Slow query logging should be enabled in staging and production with alerting for queries over 250 ms.
- Backups must be automated, encrypted, and restore-tested at least monthly.

## Cache And Rate Limits

- Production cache store: Redis.
- Production queue connection: Redis.
- Short TTL cache is used for heavy admin dashboards. Marketplace and user-specific resources remain fresh and paginated.
- Global API throttle: 120 requests/minute per authenticated user or IP.
- Write throttles protect feed, stories, marketplace, messages, and reservations from burst abuse.

## API Performance Strategy

- All list endpoints must be paginated or hard-capped.
- Feed comments and conversation messages are capped on initial load to avoid unbounded payloads.
- Heavy notifications are queued. Web requests should not wait for database notification fan-out.
- Media should be transformed outside the request path before large-scale launch.

## Release Gates

- `php artisan test`
- `composer run test:coverage`
- `npm run test:coverage`
- `npm run build`
- SonarQube scan with `SONAR_TOKEN`, backend Clover, and frontend LCOV present.
- Smoke tests against live `/api`, auth, marketplace, stories, reservations, and the built frontend preview.
