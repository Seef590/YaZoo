<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class EnsureCookieAuthenticatedMutationsAreCsrfProtected
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethodSafe() || ! $request->cookies->has('yazoo_api_token')) {
            return $next($request);
        }

        abort_unless($this->originIsAllowed($request), 419, 'Origine CSRF invalide.');
        abort_unless($this->tokensMatch($request), 419, 'Token CSRF invalide.');

        return $next($request);
    }

    protected function originIsAllowed(Request $request): bool
    {
        $origin = $request->headers->get('Origin') ?: $request->headers->get('Referer');

        if (! is_string($origin) || trim($origin) === '') {
            return false;
        }

        $candidate = $this->normalizeOrigin($origin);

        if ($candidate === null) {
            return false;
        }

        $allowedOrigins = collect(config('cors.allowed_origins', []))
            ->merge([(string) config('app.frontend_url'), (string) config('app.url')])
            ->filter(fn (mixed $value): bool => is_string($value) && trim($value) !== '')
            ->map(fn (string $value): ?string => $this->normalizeOrigin($value))
            ->filter()
            ->unique()
            ->values();

        return $allowedOrigins->contains($candidate);
    }

    protected function tokensMatch(Request $request): bool
    {
        $cookieToken = $this->normalizeToken($request->cookies->get('XSRF-TOKEN'));
        $headerToken = $this->normalizeToken(
            $request->headers->get('X-XSRF-TOKEN') ?: $request->headers->get('X-CSRF-TOKEN')
        );

        return is_string($cookieToken)
            && is_string($headerToken)
            && $cookieToken !== ''
            && hash_equals($cookieToken, $headerToken);
    }

    protected function normalizeOrigin(string $origin): ?string
    {
        $parts = parse_url($origin);

        if (! is_array($parts) || empty($parts['scheme']) || empty($parts['host'])) {
            return null;
        }

        $scheme = strtolower((string) $parts['scheme']);
        $host = strtolower((string) $parts['host']);
        $port = isset($parts['port']) ? ':'.(int) $parts['port'] : '';

        return "{$scheme}://{$host}{$port}";
    }

    protected function normalizeToken(mixed $token): ?string
    {
        if (! is_string($token) || $token === '') {
            return null;
        }

        $decoded = rawurldecode($token);

        try {
            return Crypt::decryptString($decoded);
        } catch (Throwable) {
            return $decoded;
        }
    }
}
