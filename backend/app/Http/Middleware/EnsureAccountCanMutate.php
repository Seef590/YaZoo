<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountCanMutate
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethodSafe() || $this->isAllowedMutation($request)) {
            return $next($request);
        }

        $user = $request->user();

        abort_if((bool) $user?->banned_at, 403, __('messages.admin.user_banned'));
        abort_if((bool) $user?->is_suspended, 403, __('messages.admin.user_suspended'));

        return $next($request);
    }

    protected function isAllowedMutation(Request $request): bool
    {
        return $request->is('api/auth/logout')
            || $request->is('api/privacy/*');
    }
}
