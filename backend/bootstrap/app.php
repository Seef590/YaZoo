<?php

use App\Http\Controllers\HealthController;
use App\Http\Middleware\ForceHttps;
use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\UseSanctumTokenFromCookie;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withCommands()
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function (): void {
            Route::get('/health', [HealthController::class, 'live']);
            Route::get('/health/live', [HealthController::class, 'live']);
            Route::get('/health/ready', [HealthController::class, 'ready']);
        },
    )
    ->withBroadcasting(__DIR__.'/../routes/channels.php', [
        'middleware' => [
            UseSanctumTokenFromCookie::class,
            'auth:sanctum',
        ],
    ])
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->append(ForceHttps::class);
        $middleware->append(SecurityHeaders::class);

        $middleware->prependToPriorityList(
            AuthenticatesRequests::class,
            ForceJsonResponse::class,
        );

        $middleware->prependToPriorityList(
            AuthenticatesRequests::class,
            UseSanctumTokenFromCookie::class,
        );
    })
    ->withSchedule(function (Schedule $schedule): void {
        if (! (bool) env('MEDIA_BACKUP_ENABLED', false)) {
            return;
        }

        $schedule
            ->command('yazoo:backup-media --keep='.(int) env('MEDIA_BACKUP_KEEP_DAYS', 7))
            ->dailyAt((string) env('MEDIA_BACKUP_SCHEDULE', '03:30'))
            ->withoutOverlapping();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->context(fn (): array => [
            'broadcast_connection' => config('broadcasting.default'),
            'media_driver' => config('media.driver'),
        ]);

        $exceptions->render(function (AuthenticationException $exception, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });

        $exceptions->report(function (Throwable $exception): void {
            Log::channel((string) env('MONITORING_LOG_CHANNEL', 'observability'))
                ->error($exception->getMessage(), [
                    'exception' => $exception::class,
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                    'trace' => $exception->getTraceAsString(),
                ]);
        });
    })->create();
