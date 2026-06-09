<?php

namespace Tests\Feature\Community;

use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommunityApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_communities_with_search(): void
    {
        $user = User::factory()->create();

        Community::factory()->create([
            'name' => 'Chats de Casablanca',
            'description' => 'Conseils et entraide feline',
        ]);

        Community::factory()->create([
            'name' => 'Passion chiens',
            'description' => 'Promenades et education',
        ]);

        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/communities?q=Chats')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Chats de Casablanca');
    }

    public function test_authenticated_user_can_create_and_update_a_community(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $createResponse = $this->postJson('/api/communities', [
            'name' => 'Adoption Maroc',
            'description' => "Espace d'entraide pour l'adoption.",
            'image_url' => 'https://example.com/community.jpg',
            'is_private' => false,
        ]);

        $communityId = $createResponse->json('data.id');

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.name', 'Adoption Maroc')
            ->assertJsonPath('data.isAdmin', true)
            ->assertJsonPath('data.membersCount', 1);

        $this->putJson("/api/communities/{$communityId}", [
            'name' => 'Adoption Maroc Officiel',
            'description' => "Espace officiel d'entraide.",
            'image_url' => 'https://example.com/community2.jpg',
            'is_private' => true,
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Adoption Maroc Officiel')
            ->assertJsonPath('data.isPrivate', true);
    }

    public function test_user_can_join_public_community_and_request_private_community(): void
    {
        $user = User::factory()->create();
        $publicCommunity = Community::factory()->create(['is_private' => false]);
        $privateCommunity = Community::factory()->create(['is_private' => true]);

        Sanctum::actingAs($user, ['*']);

        $this->postJson("/api/communities/{$publicCommunity->id}/join")
            ->assertOk()
            ->assertJsonPath('data.membershipStatus', 'approved')
            ->assertJsonPath('data.isMember', true);

        $this->postJson("/api/communities/{$privateCommunity->id}/join")
            ->assertOk()
            ->assertJsonPath('data.membershipStatus', 'pending')
            ->assertJsonPath('data.isMember', false);
    }

    public function test_user_can_leave_a_community_but_last_admin_cannot_leave(): void
    {
        $user = User::factory()->create();
        $community = Community::factory()->create(['user_id' => $user->id]);
        CommunityMember::factory()->create([
            'community_id' => $community->id,
            'user_id' => $user->id,
            'role' => 'admin',
            'status' => 'approved',
        ]);

        Sanctum::actingAs($user, ['*']);

        $this->deleteJson("/api/communities/{$community->id}/leave")
            ->assertStatus(422);

        $otherAdmin = User::factory()->create();
        CommunityMember::factory()->create([
            'community_id' => $community->id,
            'user_id' => $otherAdmin->id,
            'role' => 'admin',
            'status' => 'approved',
        ]);

        $this->deleteJson("/api/communities/{$community->id}/leave")
            ->assertOk()
            ->assertJsonPath('data.membershipStatus', null);
    }

    public function test_admin_can_list_and_approve_pending_requests(): void
    {
        $admin = User::factory()->create();
        $requester = User::factory()->create([
            'name' => 'Membre en attente',
            'email' => 'pending@example.com',
        ]);
        $community = Community::factory()->create([
            'user_id' => $admin->id,
            'is_private' => true,
        ]);

        CommunityMember::factory()->create([
            'community_id' => $community->id,
            'user_id' => $admin->id,
            'role' => 'admin',
            'status' => 'approved',
        ]);

        $pendingMembership = CommunityMember::factory()->create([
            'community_id' => $community->id,
            'user_id' => $requester->id,
            'role' => 'member',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($admin, ['*']);

        $this->getJson("/api/communities/{$community->id}/membership-requests")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.user.email', 'pending@example.com');

        $this->postJson("/api/communities/{$community->id}/membership-requests/{$pendingMembership->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('community.pendingRequestsCount', 0)
            ->assertJsonPath('community.membersCount', 2);

        $this->assertDatabaseHas('community_members', [
            'id' => $pendingMembership->id,
            'status' => 'approved',
        ]);

        $this->assertSame(1, $requester->notifications()->count());
        $this->assertSame(
            'community_request_approved',
            $requester->notifications()->first()->data['kind'],
        );
    }

    public function test_admin_can_reject_pending_requests(): void
    {
        $admin = User::factory()->create();
        $requester = User::factory()->create();
        $community = Community::factory()->create([
            'user_id' => $admin->id,
            'is_private' => true,
        ]);

        CommunityMember::factory()->create([
            'community_id' => $community->id,
            'user_id' => $admin->id,
            'role' => 'admin',
            'status' => 'approved',
        ]);

        $pendingMembership = CommunityMember::factory()->create([
            'community_id' => $community->id,
            'user_id' => $requester->id,
            'role' => 'member',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($admin, ['*']);

        $this->deleteJson("/api/communities/{$community->id}/membership-requests/{$pendingMembership->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $pendingMembership->id)
            ->assertJsonPath('community.pendingRequestsCount', 0)
            ->assertJsonPath('community.membersCount', 1);

        $this->assertDatabaseMissing('community_members', [
            'id' => $pendingMembership->id,
        ]);

        $this->assertSame(1, $requester->notifications()->count());
        $this->assertSame(
            'community_request_rejected',
            $requester->notifications()->first()->data['kind'],
        );
    }

    public function test_non_admin_cannot_manage_pending_requests(): void
    {
        $admin = User::factory()->create();
        $viewer = User::factory()->create();
        $requester = User::factory()->create();
        $community = Community::factory()->create([
            'user_id' => $admin->id,
            'is_private' => true,
        ]);

        CommunityMember::factory()->create([
            'community_id' => $community->id,
            'user_id' => $admin->id,
            'role' => 'admin',
            'status' => 'approved',
        ]);

        $pendingMembership = CommunityMember::factory()->create([
            'community_id' => $community->id,
            'user_id' => $requester->id,
            'role' => 'member',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($viewer, ['*']);

        $this->getJson("/api/communities/{$community->id}/membership-requests")
            ->assertForbidden();

        $this->postJson("/api/communities/{$community->id}/membership-requests/{$pendingMembership->id}/approve")
            ->assertForbidden();
    }
}
