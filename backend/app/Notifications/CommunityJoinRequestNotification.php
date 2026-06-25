<?php

namespace App\Notifications;

use App\Models\Community;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class CommunityJoinRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Community $community,
        protected User $requester,
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
            'kind' => 'community_join_request',
            'title' => 'Nouvelle demande de communaute',
            'body' => $this->requester->name.' souhaite rejoindre '.$this->community->name.'.',
            'action_url' => '/communities/'.$this->community->id,
            'meta' => [
                'community_id' => $this->community->id,
                'community_name' => $this->community->name,
                'requester_id' => $this->requester->id,
                'requester_name' => $this->requester->name,
            ],
        ];
    }
}
