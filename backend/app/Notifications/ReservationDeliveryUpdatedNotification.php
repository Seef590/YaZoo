<?php

namespace App\Notifications;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ReservationDeliveryUpdatedNotification extends Notification implements ShouldQueue
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
            'kind' => 'reservation_delivery_updated',
            'title' => 'Livraison mise a jour',
            'body' => 'Le statut de livraison pour '.$this->listingTitle().' est maintenant: '.$this->deliveryLabel().'.',
            'action_url' => '/reservations',
            'meta' => [
                'reservation_id' => $this->reservation->id,
                'delivery_status' => $this->reservation->delivery_status,
                'listing_title' => $this->listingTitle(),
            ],
        ];
    }

    protected function listingTitle(): string
    {
        return $this->reservation->reservable?->name ?? 'votre commande';
    }

    protected function deliveryLabel(): string
    {
        return match ($this->reservation->delivery_status) {
            'preparing' => 'en preparation',
            'ready_for_pickup' => 'prete au retrait',
            'shipped' => 'expediee',
            'delivered' => 'livree',
            'picked_up' => 'recuperee',
            default => 'en attente',
        };
    }
}
