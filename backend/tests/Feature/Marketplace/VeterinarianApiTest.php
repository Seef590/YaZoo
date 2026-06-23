<?php

namespace Tests\Feature\Marketplace;

use App\Models\User;
use App\Models\Veterinarian;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VeterinarianApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_veterinarians_with_filters(): void
    {
        $user = User::factory()->create();

        Veterinarian::factory()->create([
            'name' => 'Dr Sara Vet',
            'city' => 'Casablanca',
            'specialties' => ['cats', 'surgery'],
            'is_active' => true,
        ]);

        Veterinarian::factory()->create([
            'name' => 'Inactive Rabat Vet',
            'city' => 'Rabat',
            'specialties' => ['dogs'],
            'is_active' => false,
        ]);

        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/veterinarians?search=Sara&city=Casa&specialty=cats')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Dr Sara Vet')
            ->assertJsonPath('data.0.city', 'Casablanca')
            ->assertJsonPath('data.0.isActive', true);
    }

    public function test_authenticated_user_can_create_update_and_delete_veterinarian(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $createResponse = $this->postJson('/api/veterinarians', [
            'name' => 'Dr Youssef',
            'clinic_name' => 'Clinique YaZoo',
            'description' => 'Cabinet veterinaire pour chats et chiens.',
            'city' => 'Casablanca',
            'address' => 'Maarif',
            'phone' => '+212600000000',
            'whatsapp' => '+212600000001',
            'email' => 'vet@example.com',
            'specialties' => ['cats', 'dogs'],
            'working_hours' => ['monday' => '09:00-18:00'],
            'latitude' => 33.5731104,
            'longitude' => -7.5898434,
            'location_url' => 'https://maps.google.com/?q=33.5731104,-7.5898434',
            'is_active' => true,
        ]);

        $veterinarianId = $createResponse->json('data.id');

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.name', 'Dr Youssef')
            ->assertJsonPath('data.clinicName', 'Clinique YaZoo')
            ->assertJsonPath('data.specialties.0', 'cats');

        $this->patchJson("/api/veterinarians/{$veterinarianId}", [
            'name' => 'Dr Youssef Updated',
            'city' => 'Rabat',
            'specialties' => ['surgery'],
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Dr Youssef Updated')
            ->assertJsonPath('data.city', 'Rabat')
            ->assertJsonPath('data.specialties.0', 'surgery');

        $this->deleteJson("/api/veterinarians/{$veterinarianId}")
            ->assertOk()
            ->assertJsonPath('message', 'Veterinaire supprime avec succes.');

        $this->assertSoftDeleted('veterinarians', ['id' => $veterinarianId]);
    }

    public function test_validation_fails_without_name(): void
    {
        Sanctum::actingAs(User::factory()->create(), ['*']);

        $this->postJson('/api/veterinarians', [
            'city' => 'Casablanca',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_user_cannot_update_or_delete_another_users_veterinarian(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $veterinarian = Veterinarian::factory()->create(['user_id' => $other->id]);

        Sanctum::actingAs($user, ['*']);

        $this->patchJson("/api/veterinarians/{$veterinarian->id}", [
            'name' => 'Refus',
        ])->assertForbidden();

        $this->deleteJson("/api/veterinarians/{$veterinarian->id}")
            ->assertForbidden();
    }
}
