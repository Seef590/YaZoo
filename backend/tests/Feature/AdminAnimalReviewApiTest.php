<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAnimalReviewApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_and_update_animal_legal_status(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $animal = Animal::factory()->create([
            'legal_status' => 'pending_review',
        ]);

        Sanctum::actingAs($admin, ['*']);

        $this->getJson('/api/admin/animals/review')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $animal->id,
                'legalStatus' => 'pending_review',
            ]);

        $this->patchJson("/api/admin/animals/{$animal->id}/legal-status", [
            'legal_status' => 'approved',
            'moderation_note' => 'Annonce approuvee par moderation YaZoo.',
        ])
            ->assertOk()
            ->assertJsonPath('animal.legalStatus', 'approved');

        $this->assertDatabaseHas('animals', [
            'id' => $animal->id,
            'legal_status' => 'approved',
        ]);
    }

    public function test_non_admin_cannot_review_animal_legal_status(): void
    {
        $user = User::factory()->create();
        $animal = Animal::factory()->create();

        Sanctum::actingAs($user, ['*']);

        $this->patchJson("/api/admin/animals/{$animal->id}/legal-status", [
            'legal_status' => 'approved',
        ])->assertForbidden();
    }
}
