<?php

namespace App\Notifications;

use App\Models\Community;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class CommunityJoinedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Community $community,
        protected User $member,
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
            'kind' => 'community_joined',
            'title' => 'Nouveau membre',
            'body' => $this->member->name.' a rejoint '.$this->community->name.'.',
            'action_url' => '/communities/'.$this->community->id,
            'meta' => [
                'community_id' => $this->community->id,
                'community_name' => $this->community->name,
                'member_id' => $this->member->id,
                'member_name' => $this->member->name,
            ],
        ];
    }
}
