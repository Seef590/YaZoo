<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsNotSuspended
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        abort_if((bool) $user?->banned_at, 403, __('messages.admin.user_banned'));
        abort_if((bool) $user?->is_suspended, 403, __('messages.admin.user_suspended'));

        return $next($request);
    }
}
