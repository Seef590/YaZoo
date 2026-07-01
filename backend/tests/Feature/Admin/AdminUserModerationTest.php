<?php

namespace Tests\Feature\Admin;

use App\Models\ModerationAction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminUserModerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_suspend_user(): void
    {
        Sanctum::actingAs(User::factory()->create(), ['*']);
        $target = User::factory()->create();

        $this->patchJson("/api/admin/users/{$target->id}/suspension", [
            'action' => 'suspend',
            'reason' => 'Spam',
        ])->assertForbidden();
    }

    public function test_admin_can_suspend_and_unsuspend_user_with_audit_log(): void
    {
        $admin = User::factory()->admin()->create();
        $target = User::factory()->create();
        Sanctum::actingAs($admin, ['*']);

        $this->patchJson("/api/admin/users/{$target->id}/suspension", [
            'action' => 'suspend',
            'reason' => 'Messages abusifs',
        ])
            ->assertOk()
            ->assertJsonPath('user.isSuspended', true);

        $this->assertDatabaseHas('users', [
            'id' => $target->id,
            'is_suspended' => true,
        ]);

        $this->assertDatabaseHas('moderation_actions', [
            'admin_id' => $admin->id,
            'action' => 'suspend',
            'target_type' => User::class,
            'target_id' => $target->id,
        ]);

        $this->patchJson("/api/admin/users/{$target->id}/suspension", [
            'action' => 'unsuspend',
        ])
            ->assertOk()
            ->assertJsonPath('user.isSuspended', false);
    }

    public function test_admin_cannot_ban_self(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin, ['*']);

        $this->patchJson("/api/admin/users/{$admin->id}/ban", [
            'action' => 'ban',
            'reason' => 'Test',
        ])->assertUnprocessable();
    }

    public function test_suspended_user_cannot_write_posts(): void
    {
        $user = User::factory()->create(['is_suspended' => true]);
        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/posts', [
            'content' => 'Tentative bloquee',
            'visibility' => 'public',
        ])->assertForbidden();
    }
}
