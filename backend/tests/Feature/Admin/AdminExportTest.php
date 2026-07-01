<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_export_stats_csv(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create(), ['*']);

        $response = $this->get('/api/admin/exports/stats.csv')
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $this->assertStringContainsString('users', $response->streamedContent());
    }

    public function test_non_admin_cannot_export_reports_csv(): void
    {
        Sanctum::actingAs(User::factory()->create(), ['*']);

        $this->get('/api/admin/exports/reports.csv')->assertForbidden();
    }
}
