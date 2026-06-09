<?php

namespace Tests\Feature\Notification;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Notifications\PostCommentedNotification;
use App\Notifications\PostLikedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_notifications_and_mark_them_as_read(): void
    {
        $user = User::factory()->create();
        $actor = User::factory()->create([
            'name' => 'YaZoo Friend',
        ]);
        $post = Post::factory()->create([
            'user_id' => $user->id,
        ]);
        $comment = Comment::factory()->create([
            'post_id' => $post->id,
            'user_id' => $actor->id,
        ]);

        $user->notify(new PostLikedNotification($post, $actor));
        $user->notify(new PostCommentedNotification($post, $comment, $actor));

        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unreadCount', 2);

        $indexResponse = $this->getJson('/api/notifications');
        $firstNotificationId = $indexResponse->json('data.0.id');

        $indexResponse
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->postJson("/api/notifications/{$firstNotificationId}/read")
            ->assertOk()
            ->assertJsonPath('data.isRead', true);

        $this->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unreadCount', 1);

        $this->postJson('/api/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('data.markedCount', 1)
            ->assertJsonPath('data.unreadCount', 0);
    }
}
