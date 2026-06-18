<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetApiLocale
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $supportedLocales = ['fr', 'ar', 'en', 'es', 'nl', 'pt', 'it'];

        $locale = (string) ($request->header('X-App-Locale')
            ?? $request->header('Accept-Language')
            ?? $request->query('locale')
            ?? $request->user()?->preferred_locale
            ?? config('app.locale', 'fr'));

        $locale = strtolower(substr(str_replace('_', '-', $locale), 0, 2));

        if (! in_array($locale, $supportedLocales, true)) {
            $locale = 'fr';
        }

        App::setLocale($locale);

        return $next($request);
    }
}
