<?php

namespace Tests\Feature\Notification;

use App\Models\Comment;
use App\Models\Conversation;
use App\Models\Post;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use App\Notifications\PostCommentedNotification;
use App\Notifications\PostLikedNotification;
use App\Notifications\UserFollowedNotification;
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
        $user->notify(new UserFollowedNotification($actor));

        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unreadCount', 3);

        $indexResponse = $this->getJson('/api/notifications');

        $indexResponse
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonMissing([
                'type' => 'new_message',
            ])
            ->assertJsonFragment([
                'type' => 'user_followed',
                'actionUrl' => '/profile/'.$actor->id,
            ])
            ->assertJsonFragment([
                'follower_name' => 'YaZoo Friend',
            ]);

        $followNotificationId = collect($indexResponse->json('data'))
            ->firstWhere('type', 'user_followed')['id'] ?? null;

        $this->assertNotNull($followNotificationId);

        $this->postJson("/api/notifications/{$followNotificationId}/read")
            ->assertOk()
            ->assertJsonPath('data.isRead', true);

        $this->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unreadCount', 2);

        $this->postJson('/api/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('data.markedCount', 2)
            ->assertJsonPath('data.unreadCount', 0);

        $this->assertNotNull(
            $user->notifications()
                ->where('type', NewMessageNotification::class)
                ->whereNull('read_at')
                ->first(),
        );
    }
}
