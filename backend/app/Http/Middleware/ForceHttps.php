<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->shouldForceHttps($request)) {
            return $next($request);
        }

        if (in_array($request->method(), ['GET', 'HEAD'], true)) {
            return redirect()->secure($request->getRequestUri(), Response::HTTP_MOVED_PERMANENTLY);
        }

        return response()->json([
            'message' => 'HTTPS is required.',
        ], Response::HTTP_UPGRADE_REQUIRED);
    }

    private function shouldForceHttps(Request $request): bool
    {
        if ($request->is('up', 'health', 'health/live', 'health/ready')) {
            return false;
        }

        if (! app()->isProduction() && ! (bool) config('app.force_https')) {
            return false;
        }

        $forwardedProto = strtolower((string) $request->headers->get('X-Forwarded-Proto'));

        return ! $request->isSecure() && $forwardedProto !== 'https';
    }
}
