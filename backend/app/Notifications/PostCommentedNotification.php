<?php

namespace App\Notifications;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class PostCommentedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        protected Post $post,
        protected Comment $comment,
        protected User $commenter,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'kind' => 'post_comment',
            'title' => 'Nouveau commentaire',
            'body' => $this->commenter->name.' a commente votre post: '.Str::limit($this->comment->body, 100),
            'action_url' => '/feed',
            'meta' => [
                'post_id' => $this->post->id,
                'comment_id' => $this->comment->id,
                'actor_id' => $this->commenter->id,
                'actor_name' => $this->commenter->name,
            ],
        ];
    }
}
