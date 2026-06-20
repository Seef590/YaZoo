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
        $supportedLocales = ['fr', 'ar', 'en'];

        $locale = (string) ($request->header('Accept-Language') ?? 'fr');

        $locale = strtolower(substr(str_replace('_', '-', trim($locale)), 0, 2));

        if (! in_array($locale, $supportedLocales, true)) {
            $locale = 'fr';
        }

        App::setLocale($locale);

        return $next($request);
    }
}
