<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MonitoringController extends Controller
{
    /**
     * Persist a frontend error report into the observability logs.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
            'stack' => ['nullable', 'string', 'max:50000'],
            'source' => ['nullable', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:2048'],
            'userAgent' => ['nullable', 'string', 'max:2048'],
            'context' => ['nullable', 'array'],
            'user' => ['nullable', 'array'],
        ]);

        Log::channel((string) env('FRONTEND_MONITORING_LOG_CHANNEL', 'frontend'))
            ->error($validated['message'], [
                'source' => $validated['source'] ?? 'frontend',
                'stack' => $validated['stack'] ?? null,
                'url' => $validated['url'] ?? null,
                'user_agent' => $validated['userAgent'] ?? null,
                'context' => $validated['context'] ?? [],
                'user' => $validated['user'] ?? null,
                'reported_at' => now()->toISOString(),
            ]);

        return response()->json([
            'message' => __('messages.monitoring.frontend_report_saved'),
        ], 202);
    }
}
