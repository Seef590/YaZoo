# YaZoo - Sonar security review

Date: 2026-07-09
Commit reviewed: `7f73962 docs: add production connected smoke test report`

## Scope

This review follows the production smoke test phase and focuses on Sonar/SonarCloud readiness, exported local Sonar findings, and security-sensitive YaZoo surfaces:

- authentication and first-admin bootstrap;
- Sanctum cookie flow and HTTPS/proxy behavior;
- professional verification document upload and private storage;
- payment and CMI callback guards;
- frontend monitoring payload masking;
- CORS, CSP-related response headers, redirects, favorites, reviews, and marketplace validation.

No real `.env`, secret, APP_KEY, CMI setting, realtime setting, migration, DockerHub state, or Azure resource was changed.

## Sonar Status

Current CI run reviewed:

- GitHub Actions `CI` for commit `7f73962`: success
- GitHub Actions `Deploy YaZoo` for commit `7f73962`: success
- SonarCloud scan step: configured but skipped because `SONAR_TOKEN` and `SONAR_ORGANIZATION` were empty in the CI environment
- Local `sonar-scanner`: available (`SonarScanner CLI 6.0.0.4432`)
- Local `SONAR_TOKEN`: not configured
- Current Quality Gate: unknown for 2026-07-09 because no authenticated Sonar analysis was run

Older local exports are present but ignored by Git:

- `sonar-issues.json`, last modified 2026-07-01
- `sonar-hotspots.json`, last modified 2026-07-01
- `.scannerwork/`, ignored

Those exports are useful for context, but they are not treated as the current production Quality Gate.

## Configuration Review

`sonar-project.properties` scopes analysis to:

- `backend/app`
- `backend/routes`
- `frontend/src`

Configured test paths:

- `backend/tests`
- `frontend/src`

Configured exclusions include dependencies, coverage, Laravel runtime storage/cache, generated coverage, and large i18n/entrypoint files where appropriate. Since `sonar.sources` is already narrow, frontend `dist`, root backups, and local scanner artifacts are outside the analyzed source roots. Git ignore rules also exclude `.scannerwork/`, `.sonar/`, `sonar-hotspots.json`, `sonar-issues.json`, `node_modules/`, `vendor/`, `dist/`, `coverage/`, logs, dumps, archives, and secrets.

No Sonar token or secret was found in tracked Sonar configuration.

## Older Export Summary

From the 2026-07-01 local exports:

- Issues: 225 total
- Bugs: 1 major
- Vulnerabilities: none reported in the export
- Code smells: 224
- Security hotspots: 20

Issue distribution:

- 131 major code smells
- 74 critical code smells
- 19 minor code smells
- 1 major bug

Top noisy rules:

- `php:S103` line length: 62
- `php:S1192` duplicated string literals: 27
- `javascript:S3776` cognitive complexity: 26
- `javascript:S3735` accessibility/button semantics: 17
- `javascript:S3358` nested ternary readability: 16

These older code smells were not bulk-refactored because doing so after production would create more risk than value without a current Quality Gate failure.

## Hotspots Reviewed

| Rule | Area | Current assessment | Action |
| --- | --- | --- | --- |
| `javascript:S2068` | `frontend/src/lib/i18n.js` password labels/placeholders | Safe false positive. These are visible UI translations such as password field labels, show/hide password text, and placeholder strings. They are not credentials. | Mark `SAFE` in Sonar UI with this justification after the next authenticated scan. |
| `javascript:S5852` | `frontend/src/lib/appConfig.js` URL normalization | Fixed in current code. The risky regex was replaced by bounded trimming and `toLowerCase().endsWith('/api')`. | No code action. Re-run Sonar to clear stale export. |
| `javascript:S2245` | `frontend/src/contexts/ToastContext.jsx` toast IDs | Fixed in current code. Toast IDs use a local monotonic counter, not `Math.random()`. IDs are not security tokens. | No code action. Re-run Sonar to clear stale export. |
| `php:S4790` | `backend/app/Support/Auth/PhoneOtpBroker.php` OTP cache key | Fixed in current code. Cache key uses `hash_hmac('sha256', phone, APP_KEY)` and OTP values are stored as Laravel hashes. | Covered by `PhoneOtpBrokerTest`; no code action. |
| `php:S5693` | Feed/story/community/profile media upload max sizes | Acknowledged. Media upload limits are explicit and tested. Feed/story/community allow up to 50 MiB for user media; profile avatar/cover use smaller limits. This is acceptable only with platform/server upload limits, auth, rate limiting, and monitoring. | Keep acknowledged. Do not lower abruptly without product/media policy decision. |

## Security Surface Review

Professional verification:

- Upload validation restricts MIME types and file size.
- Documents are stored on the Laravel `local` disk under a UUID filename.
- Downloads require admin authorization.
- API resource always returns `documentPath: null`.
- Production connected smoke confirmed no public `document_path` key in `/api/professional-verifications/me`.

Payments and CMI:

- `/api/payments/config` returns CMI disabled unless the flag is enabled and full config is present.
- CMI callback validates provider handling and signature logic.
- Payment transaction payloads redact card, token, hash, signature, store key, password, and related sensitive keys.
- Connected production smoke confirmed `providers.cmi.enabled=false`.

Authentication and admin bootstrap:

- Public registration does not create admin in production unless explicit bootstrap config and allowed environment match.
- Tests cover production admin bootstrap blocking.
- Auth cookie is encrypted, httpOnly, and forced Secure when `SameSite=None`.

Monitoring and logs:

- Frontend monitoring masks sensitive keys recursively.
- URLs are sanitized by removing query strings and fragments.
- Activity/moderation logging has key blocking for password/token/secret/OTP style fields.

CORS, HTTPS, and redirects:

- CORS allowed origins are explicit and credentials are enabled.
- Force HTTPS middleware honors `X-Forwarded-Proto=https`, preventing incorrect Azure proxy redirects.
- Google OAuth redirects use configured frontend URLs, not user-controlled query parameters.

Favorites and reviews:

- Favorite type is whitelisted to animals/products/services/veterinarians.
- Reviews require completed reservations and participants only; backend tests cover refusal before completion, duplicate reviews, self review, and non-participant attempts.

## Code Changes

No code changes were made during this Sonar review. The current stale exports point mostly to already-fixed items or non-critical maintainability smells. No active vulnerability was identified that justified a production-risking refactor.

## Generated Files

Ignored and not staged:

- `.scannerwork/`
- `sonar-issues.json`
- `sonar-hotspots.json`

These files must remain local and must not be committed.

## Validation

Local validation for this review should include:

- `php artisan test`
- `npm.cmd run lint`
- `npm.cmd test -- --run`
- `npm.cmd run build`
- `npm.cmd run test:e2e`
- `node scripts/audit-i18n.mjs`
- `git diff --check`

## Remaining Risks

- Current Sonar Quality Gate is unknown until a valid `SONAR_TOKEN` and `SONAR_ORGANIZATION` are configured and the scan runs.
- Older exports still show maintainability debt, especially line length, duplicated strings, cognitive complexity, and nested ternaries.
- Upload media policy should be revisited with Azure/nginx/PHP limits, quota monitoring, and optional malware scanning before heavy user-generated media growth.
- GitHub Actions shows a Node.js 20 deprecation warning from third-party actions being forced to Node 24; this is non-blocking but should be monitored.

## Next Actions

1. Configure GitHub secret `SONAR_TOKEN` and variable `SONAR_ORGANIZATION`, or set a local token in the shell only.
2. Re-run the SonarCloud scan for `main`.
3. Review the current Sonar UI Security Hotspots:
   - mark i18n password labels as `SAFE`;
   - keep media upload limits `ACKNOWLEDGED` until a formal media policy is approved;
   - verify stale regex/RNG/weak-hash hotspots disappear.
4. Address only current high-value findings: bugs, vulnerabilities, unsafe redirects, upload/storage flaws, secrets/logging, CORS/cookie issues, payment callback issues, and path traversal.
5. Avoid broad cosmetic refactors unless the Quality Gate requires them and tests can cover the change.
