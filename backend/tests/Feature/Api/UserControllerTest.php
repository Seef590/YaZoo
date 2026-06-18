<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_authenticated_user_profile(): void
    {
        $user = User::factory()->create();

        $this->getJson("/api/users/{$user->id}")
            ->assertUnauthorized();
    }

    public function test_authenticated_user_can_view_public_profile(): void
    {
        $viewer = User::factory()->create();
        $profile = User::factory()->create([
            'name' => 'Sara Adoption',
            'city' => 'Rabat',
        ]);

        Sanctum::actingAs($viewer);

        $this->getJson("/api/users/{$profile->id}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Sara Adoption')
            ->assertJsonPath('data.city', 'Rabat')
            ->assertJsonPath('data.email', null);
    }

    public function test_authenticated_user_profile_lookup_with_numeric_id_does_not_return_unprocessable(): void
    {
        $viewer = User::factory()->create();
        $profile = User::factory()->create();

        Sanctum::actingAs($viewer);

        $this->getJson("/api/users/{$profile->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $profile->id);

        $this->getJson('/api/users/999999')
            ->assertNotFound();
    }

    public function test_authenticated_user_can_list_user_suggestions_without_self_or_emails(): void
    {
        $viewer = User::factory()->create();
        $suggested = User::factory()->create([
            'name' => 'Suggested Member',
            'email' => 'suggested@example.test',
        ]);

        Sanctum::actingAs($viewer);

        $this->getJson('/api/users/suggestions')
            ->assertOk()
            ->assertJsonPath('data.0.id', $suggested->id)
            ->assertJsonPath('data.0.name', 'Suggested Member')
            ->assertJsonPath('data.0.email', null)
            ->assertJsonMissing(['id' => $viewer->id]);
    }

    public function test_register_validates_required_contact_and_credentials(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'No Contact',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['phone', 'otp_code']);
    }

    public function test_register_then_login_with_email_password(): void
    {
        $payload = [
            'name' => 'Imane Client',
            'email' => 'imane@example.test',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'device_name' => 'phpunit',
        ];

        $this->postJson('/api/auth/register', $payload)
            ->assertCreated()
            ->assertJsonPath('user.name', 'Imane Client');

        $this->postJson('/api/auth/login', [
            'email' => 'imane@example.test',
            'password' => 'secret123',
            'device_name' => 'phpunit',
        ])
            ->assertOk()
            ->assertJsonPath('user.name', 'Imane Client');
    }

    public function test_authenticated_user_can_read_me_payload(): void
    {
        $user = User::factory()->create([
            'name' => 'Auth User',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.name', 'Auth User');
    }
}
