<?php

namespace App\Notifications;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ReservationRequestedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        protected Reservation $reservation,
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
            'kind' => 'reservation_requested',
            'title' => 'Nouvelle demande de reservation',
            'body' => $this->reservation->buyer->name.' a envoye une demande de reservation pour '.$this->listingTitle().'.',
            'action_url' => '/reservations',
            'meta' => [
                'reservation_id' => $this->reservation->id,
                'listing_title' => $this->listingTitle(),
            ],
        ];
    }

    /**
     * Resolve the listing title.
     */
    protected function listingTitle(): string
    {
        return $this->reservation->reservable?->name ?? 'votre annonce';
    }
}
