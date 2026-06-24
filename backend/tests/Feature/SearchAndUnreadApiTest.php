<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\Community;
use App\Models\Conversation;
use App\Models\Product;
use App\Models\ServiceListing;
use App\Models\User;
use App\Models\Veterinarian;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SearchAndUnreadApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_get_unread_message_count(): void
    {
        $recipient = User::factory()->create();
        $sender = User::factory()->create();
        $conversation = Conversation::query()->create([
            'participant_one_id' => min($recipient->id, $sender->id),
            'participant_two_id' => max($recipient->id, $sender->id),
        ]);

        $conversation->messages()->create([
            'user_id' => $sender->id,
            'body' => 'Message non lu',
            'read_at' => null,
        ]);
        $conversation->messages()->create([
            'user_id' => $recipient->id,
            'body' => 'Mon propre message',
            'read_at' => null,
        ]);

        Sanctum::actingAs($recipient, ['*']);

        $this->getJson('/api/messages/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unreadCount', 1)
            ->assertJsonPath('data.unread_count', 1);
    }

    public function test_guest_cannot_get_unread_message_count(): void
    {
        $this->getJson('/api/messages/unread-count')->assertUnauthorized();
    }

    public function test_search_users_returns_public_safe_results(): void
    {
        $viewer = User::factory()->create();
        User::factory()->create([
            'name' => 'Youssef Vet',
            'email' => 'secret@example.test',
            'city' => 'Casablanca',
        ]);

        Sanctum::actingAs($viewer, ['*']);

        $this->getJson('/api/search/users?q=Youssef')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Youssef Vet')
            ->assertJsonMissingPath('data.0.email')
            ->assertJsonMissingPath('data.0.password')
            ->assertJsonMissingPath('data.0.remember_token');
    }

    public function test_global_search_returns_expected_sections(): void
    {
        $viewer = User::factory()->create();
        User::factory()->create(['name' => 'Atlas User']);
        Community::factory()->create(['name' => 'Atlas Community']);
        Animal::factory()->create(['name' => 'Atlas Cat']);
        Product::factory()->create(['name' => 'Atlas Food']);
        ServiceListing::factory()->create([
            'title' => 'Atlas Training',
            'status' => 'active',
        ]);
        Veterinarian::factory()->create([
            'name' => 'Atlas Vet',
            'is_active' => true,
        ]);

        Sanctum::actingAs($viewer, ['*']);

        $this->getJson('/api/search?q=Atlas')
            ->assertOk()
            ->assertJsonCount(1, 'data.users')
            ->assertJsonCount(1, 'data.communities')
            ->assertJsonCount(1, 'data.animals')
            ->assertJsonCount(1, 'data.products')
            ->assertJsonCount(1, 'data.services')
            ->assertJsonCount(1, 'data.veterinarians');
    }

    public function test_short_search_query_returns_empty_sections(): void
    {
        $viewer = User::factory()->create();

        Sanctum::actingAs($viewer, ['*']);

        $this->getJson('/api/search?q=a')
            ->assertOk()
            ->assertJsonPath('data.users', [])
            ->assertJsonPath('data.communities', [])
            ->assertJsonPath('data.animals', [])
            ->assertJsonPath('data.products', [])
            ->assertJsonPath('data.services', [])
            ->assertJsonPath('data.veterinarians', []);
    }
}
