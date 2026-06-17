<?php

namespace App\Policies;

use App\Models\Animal;
use App\Models\Product;
use App\Models\Reservation;
use App\Models\ServiceListing;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ReservationPolicy
{
    /**
     * Determine whether the user can list their reservations.
     */
    public function viewAny(User $user): bool
    {
        return $user->exists;
    }

    /**
     * Determine whether the user can view a reservation invoice.
     */
    public function viewInvoice(User $user, Reservation $reservation): bool
    {
        return $this->isParticipant($user, $reservation) || (bool) $user->is_admin;
    }

    /**
     * Determine whether the user can create a reservation for an animal.
     */
    public function createAnimal(User $user, Animal $animal): bool
    {
        return ! $user->is($animal->user);
    }

    /**
     * Determine whether the user can create a reservation for a product.
     */
    public function createProduct(User $user, Product $product): bool
    {
        return ! $user->is($product->user);
    }

    /**
     * Determine whether the seller can approve a reservation.
     */
    public function approve(User $user, Reservation $reservation): bool
    {
        return $user->id === $reservation->seller_id || (bool) $user->is_admin;
    }

    /**
     * Determine whether the seller can reject a reservation.
     */
    public function reject(User $user, Reservation $reservation): bool
    {
        return $user->id === $reservation->seller_id || (bool) $user->is_admin;
    }

    /**
     * Determine whether the seller can update the delivery status.
     */
    public function updateDeliveryStatus(User $user, Reservation $reservation): bool
    {
        return $user->id === $reservation->seller_id || (bool) $user->is_admin;
    }

    /**
     * Determine whether the buyer can cancel a reservation.
     */
    public function cancel(User $user, Reservation $reservation): bool
    {
        return $user->id === $reservation->buyer_id || (bool) $user->is_admin;
    }

    /**
     * Determine whether the seller can complete a reservation.
     */
    public function complete(User $user, Reservation $reservation): bool
    {
        return $user->id === $reservation->seller_id || (bool) $user->is_admin;
    }

    public function createService(User $user, ServiceListing $service): bool
    {
        return ! $user->is($service->user);
    }

    /**
     * Determine whether the user can access the admin orders dashboard.
     */
    public function viewAdminDashboard(User $user): Response
    {
        return $user->is_admin
            ? Response::allow()
            : Response::deny('Acces reserve aux admins.');
    }

    /**
     * Determine whether the user belongs to the reservation.
     */
    protected function isParticipant(User $user, Reservation $reservation): bool
    {
        return in_array($user->id, [$reservation->buyer_id, $reservation->seller_id], true);
    }
}
