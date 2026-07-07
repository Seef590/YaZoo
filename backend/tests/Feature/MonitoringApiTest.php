<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class MonitoringApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_frontend_monitoring_masks_sensitive_payload_values(): void
    {
        Log::shouldReceive('channel')
            ->once()
            ->with('frontend')
            ->andReturnSelf();

        Log::shouldReceive('error')
            ->once()
            ->with(
                'Frontend boom',
                \Mockery::on(function (array $context): bool {
                    return $context['url'] === 'https://yazoo.test/feed'
                        && $context['context']['token'] === '[masked]'
                        && $context['context']['nested']['password'] === '[masked]'
                        && $context['user']['client_secret'] === '[masked]';
                })
            );

        $this->postJson('/api/monitoring/frontend-error', [
            'message' => 'Frontend boom',
            'source' => 'frontend',
            'url' => 'https://yazoo.test/feed?token=secret-value',
            'context' => [
                'token' => 'secret-value',
                'nested' => [
                    'password' => 'hidden',
                ],
            ],
            'user' => [
                'id' => 7,
                'client_secret' => 'hidden',
            ],
        ])->assertAccepted();
    }
}
