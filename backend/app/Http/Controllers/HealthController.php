<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Throwable;

class HealthController extends Controller
{
    public function live(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'service' => 'yazoo-api',
        ]);
    }

    public function ready(): JsonResponse
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
        ];

        $ready = collect($checks)->every(fn (array $check): bool => $check['ok']);

        return response()->json([
            'status' => $ready ? 'ok' : 'degraded',
            'service' => 'yazoo-api',
            'checks' => $checks,
        ], $ready ? 200 : 503);
    }

    private function checkDatabase(): array
    {
        try {
            DB::select('select 1');

            return ['ok' => true];
        } catch (Throwable $exception) {
            return [
                'ok' => false,
                'error' => $exception->getMessage(),
            ];
        }
    }

    private function checkRedis(): array
    {
        if (! $this->usesRedis()) {
            return ['ok' => true, 'skipped' => true];
        }

        try {
            Redis::connection()->ping();

            return ['ok' => true];
        } catch (Throwable $exception) {
            return [
                'ok' => false,
                'error' => $exception->getMessage(),
            ];
        }
    }

    private function usesRedis(): bool
    {
        return collect([
            config('cache.default'),
            config('queue.default'),
            config('session.driver'),
        ])->contains('redis');
    }
}
