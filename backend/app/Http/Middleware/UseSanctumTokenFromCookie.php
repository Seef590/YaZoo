<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class UseSanctumTokenFromCookie
{
    /**
     * Promote the httpOnly auth cookie to a Bearer token for Sanctum.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->bearerToken()) {
            return $next($request);
        }

        $token = $this->resolveTokenFromCookie($request->cookie('yazoo_api_token'));

        if ($token !== null) {
            $authorization = 'Bearer '.$token;

            $request->headers->set('Authorization', $authorization);
            $request->server->set('HTTP_AUTHORIZATION', $authorization);

            $authenticatedUser = $this->resolveAuthenticatedUserFromToken($token);
            $guard = Auth::guard('sanctum');

            if (method_exists($guard, 'forgetUser')) {
                $guard->forgetUser();
            }

            if ($authenticatedUser !== null) {
                $request->setUserResolver(static fn (): Authenticatable => $authenticatedUser);

                if (method_exists($guard, 'setUser')) {
                    $guard->setUser($authenticatedUser);
                }
            }

            if (method_exists($guard, 'setRequest')) {
                $guard->setRequest($request);
            }
        }

        return $next($request);
    }

    /**
     * Resolve the plain Sanctum token from the auth cookie.
     */
    protected function resolveTokenFromCookie(mixed $encryptedToken): ?string
    {
        if (! is_string($encryptedToken) || $encryptedToken === '') {
            return null;
        }

        foreach ($this->candidateCookieValues($encryptedToken) as $candidate) {
            try {
                return Crypt::decryptString($candidate);
            } catch (Throwable) {
                // Try the next normalized representation.
            }
        }

        return null;
    }

    /**
     * Browsers and tests may hand the encrypted cookie back with slightly different encoding.
     *
     * @return array<int, string>
     */
    protected function candidateCookieValues(string $encryptedToken): array
    {
        return array_values(array_unique(array_filter([
            $encryptedToken,
            rawurldecode($encryptedToken),
            str_replace(' ', '+', $encryptedToken),
            str_replace(' ', '+', rawurldecode($encryptedToken)),
        ])));
    }

    /**
     * Resolve the Sanctum-authenticated user tied to the personal access token.
     */
    protected function resolveAuthenticatedUserFromToken(string $token): ?Authenticatable
    {
        $accessToken = PersonalAccessToken::findToken($token);

        if (! $this->isValidAccessToken($accessToken)) {
            return null;
        }

        return $accessToken->tokenable?->withAccessToken($accessToken);
    }

    /**
     * Mirror Sanctum's token validity checks for the cookie-authenticated flow.
     */
    protected function isValidAccessToken(?PersonalAccessToken $accessToken): bool
    {
        if (! $accessToken || ! $accessToken->tokenable) {
            return false;
        }

        $expiration = config('sanctum.expiration');

        if (
            is_int($expiration)
            && $expiration > 0
            && $accessToken->created_at?->lte(now()->subMinutes($expiration))
        ) {
            return false;
        }

        if ($accessToken->expires_at?->isPast()) {
            return false;
        }

        return true;
    }
}
