<?php

namespace Tests\Feature\Admin;

use App\Models\ModerationAction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminModerationActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_moderation_actions(): void
    {
        $admin = User::factory()->admin()->create();
        ModerationAction::query()->create([
            'admin_id' => $admin->id,
            'action' => 'ban',
            'target_type' => User::class,
            'target_id' => User::factory()->create()->id,
            'reason' => 'Test',
        ]);

        Sanctum::actingAs($admin, ['*']);

        $this->getJson('/api/admin/moderation-actions')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.action', 'ban');
    }
}
