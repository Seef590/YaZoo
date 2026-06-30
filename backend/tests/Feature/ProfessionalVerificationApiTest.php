<?php

namespace Tests\Feature;

use App\Models\ProfessionalVerification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfessionalVerificationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_submit_and_list_professional_verification_requests(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/professional-verifications', [
            'business_type' => 'veterinarian',
            'legal_name' => 'Clinique YaZoo',
            'ice' => '0011223344',
            'onssa_authorization_number' => 'ONSSA-A-123',
            'professional_license_number' => 'LIC-456',
            'document_path' => 'private/professional-verifications/demo.pdf',
        ])
            ->assertCreated()
            ->assertJsonPath('verification.status', 'pending')
            ->assertJsonPath('verification.businessType', 'veterinarian');

        $this->getJson('/api/professional-verifications/me')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.legalName', 'Clinique YaZoo');
    }

    public function test_admin_can_review_professional_verification_requests(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $verification = ProfessionalVerification::query()->create([
            'user_id' => User::factory()->create()->id,
            'business_type' => 'pet_shop',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($admin, ['*']);

        $this->patchJson("/api/admin/professional-verifications/{$verification->id}/status", [
            'status' => 'approved',
            'admin_note' => 'Documents verifies par l administration YaZoo.',
        ])
            ->assertOk()
            ->assertJsonPath('verification.status', 'approved');

        $this->assertDatabaseHas('professional_verifications', [
            'id' => $verification->id,
            'status' => 'approved',
            'verified_by' => $admin->id,
        ]);
    }
}
