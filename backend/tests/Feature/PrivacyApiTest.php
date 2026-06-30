<?php

namespace Tests\Feature;

use App\Models\DataDeletionRequest;
use App\Models\PrivacyConsent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PrivacyApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_cookie_consent_is_stored_without_raw_ip(): void
    {
        $response = $this
            ->withHeader('User-Agent', 'Privacy test browser')
            ->postJson('/api/privacy/consents/public', [
                'type' => 'cookies_analytics',
                'accepted' => false,
                'locale' => 'fr',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('consent.type', 'cookies_analytics')
            ->assertJsonPath('consent.accepted', false);

        $consent = PrivacyConsent::query()->firstOrFail();

        $this->assertNull($consent->user_id);
        $this->assertFalse($consent->accepted);
        $this->assertNull($consent->accepted_at);
        $this->assertNotSame('127.0.0.1', $consent->ip_hash);
        $this->assertNotSame('Privacy test browser', $consent->user_agent_hash);
    }

    public function test_authenticated_user_can_store_consent_and_export_data(): void
    {
        $user = User::factory()->create([
            'name' => 'Privacy User',
            'email' => 'privacy@example.com',
            'phone' => '+212600000000',
        ]);

        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/privacy/consents', [
            'type' => 'sms_otp',
            'accepted' => true,
            'locale' => 'fr',
        ])
            ->assertCreated()
            ->assertJsonPath('consent.type', 'sms_otp')
            ->assertJsonPath('consent.accepted', true);

        $exportResponse = $this->getJson('/api/privacy/export');

        $exportResponse
            ->assertOk()
            ->assertJsonPath('profile.email', 'privacy@example.com')
            ->assertJsonPath('profile.phone', '+212600000000')
            ->assertJsonMissingPath('profile.password')
            ->assertJsonPath('privacyConsents.0.type', 'sms_otp')
            ->assertJsonPath('excluded.privateMessages', __('messages.privacy.export_private_messages_excluded'));
    }

    public function test_user_can_create_only_one_pending_deletion_request(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/privacy/delete-request', [
            'reason' => 'Je veux fermer mon compte.',
        ])
            ->assertCreated()
            ->assertJsonPath('request.status', 'pending');

        $this->postJson('/api/privacy/delete-request', [
            'reason' => 'Deuxieme demande.',
        ])
            ->assertOk()
            ->assertJsonPath('request.status', 'pending');

        $this->assertDatabaseCount('data_deletion_requests', 1);
    }

    public function test_admin_can_update_deletion_request_status(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['is_admin' => true]);
        $deletionRequest = DataDeletionRequest::query()->create([
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        Sanctum::actingAs($admin, ['*']);

        $this->patchJson("/api/admin/privacy/delete-requests/{$deletionRequest->id}/status", [
            'status' => 'reviewed',
            'admin_note' => 'Revue manuelle ouverte.',
        ])
            ->assertOk()
            ->assertJsonPath('request.status', 'reviewed')
            ->assertJsonPath('request.adminNote', 'Revue manuelle ouverte.');
    }
}
