<?php

namespace App\Notifications;

use App\Models\Community;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class CommunityRequestApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        protected Community $community,
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
            'kind' => 'community_request_approved',
            'title' => 'Demande acceptee',
            'body' => "Votre demande d'adhesion a la communaute ".$this->community->name.' a ete acceptee.',
            'action_url' => '/communities',
            'meta' => [
                'community_id' => $this->community->id,
                'community_name' => $this->community->name,
            ],
        ];
    }
}
