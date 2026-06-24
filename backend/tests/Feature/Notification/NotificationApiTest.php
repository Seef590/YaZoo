<?php

namespace Tests\Feature\Notification;

use App\Models\Comment;
use App\Models\Conversation;
use App\Models\Post;
use App\Models\User;
use App\Notifications\NewMessageNotification;
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
        $conversation = Conversation::query()->create([
            'participant_one_id' => min($user->id, $actor->id),
            'participant_two_id' => max($user->id, $actor->id),
        ]);
        $message = $conversation->messages()->create([
            'user_id' => $actor->id,
            'body' => 'Message prive non lu',
        ]);

        $user->notify(new PostLikedNotification($post, $actor));
        $user->notify(new PostCommentedNotification($post, $comment, $actor));
        $user->notify(new NewMessageNotification($conversation, $message, $actor));

        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unreadCount', 2);

        $indexResponse = $this->getJson('/api/notifications');
        $firstNotificationId = $indexResponse->json('data.0.id');

        $indexResponse
            ->assertOk()
            ->assertJsonCount(3, 'data');

        $this->postJson("/api/notifications/{$firstNotificationId}/read")
            ->assertOk()
            ->assertJsonPath('data.isRead', true);

        $this->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unreadCount', 1);

        $this->postJson('/api/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('data.markedCount', 2)
            ->assertJsonPath('data.unreadCount', 0);
    }
}
