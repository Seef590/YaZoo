<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class UserFollowedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected User $follower,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'kind' => 'user_followed',
            'title' => 'Nouveau follower',
            'body' => $this->follower->name.' suit maintenant votre profil YaZoo.',
            'action_url' => '/profile/'.$this->follower->id,
            'meta' => [
                'follower_id' => $this->follower->id,
                'follower_name' => $this->follower->name,
            ],
        ];
    }
}
