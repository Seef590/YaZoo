<?php

namespace Tests\Feature\Admin;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminContentModerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_suspend_content_without_deleting_it(): void
    {
        $admin = User::factory()->admin()->create();
        $product = Product::factory()->create();
        Sanctum::actingAs($admin, ['*']);

        $this->patchJson("/api/admin/content/product/{$product->id}/moderation-status", [
            'action' => 'suspend',
            'moderation_note' => 'Annonce a verifier',
        ])
            ->assertOk()
            ->assertJsonPath('moderationStatus', 'suspended');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'moderation_status' => 'suspended',
        ]);

        $this->assertDatabaseHas('moderation_actions', [
            'action' => 'suspend',
            'target_type' => Product::class,
            'target_id' => $product->id,
        ]);
    }
}
