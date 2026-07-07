<?php

namespace App\Repositories;

use App\Models\Reservation;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ReservationRepository
{
    public const RESPONSE_RELATIONS = [
        'buyer:id,name,email,phone,avatar',
        'seller:id,name,email,phone,avatar',
        'reservable.user:id,name,email,phone,avatar,city,country',
        'payments',
        'reviews.reviewer:id,name,avatar',
        'reviews.reviewee:id,name,avatar',
    ];

    public function buyerReservations(User $user, int $perPage): LengthAwarePaginator
    {
        return Reservation::query()
            ->with(self::RESPONSE_RELATIONS)
            ->where('buyer_id', $user->id)
            ->latest()
            ->paginate($perPage, ['*'], 'buyer_page');
    }

    public function sellerReservations(User $user, int $perPage): LengthAwarePaginator
    {
        return Reservation::query()
            ->with(self::RESPONSE_RELATIONS)
            ->where('seller_id', $user->id)
            ->latest()
            ->paginate($perPage, ['*'], 'seller_page');
    }

    public function buyerHistory(User $user, int $perPage): LengthAwarePaginator
    {
        return $this->historyQuery('buyer_id', $user->id)
            ->paginate($perPage, ['*'], 'buyer_history_page');
    }

    public function sellerHistory(User $user, int $perPage): LengthAwarePaginator
    {
        return $this->historyQuery('seller_id', $user->id)
            ->paginate($perPage, ['*'], 'seller_history_page');
    }

    public function lockForUpdate(Reservation $reservation): Reservation
    {
        return Reservation::query()
            ->lockForUpdate()
            ->findOrFail($reservation->id);
    }

    public function loadForResponse(Reservation $reservation): Reservation
    {
        return $reservation->refresh()->load(self::RESPONSE_RELATIONS);
    }

    protected function historyQuery(string $column, int $userId)
    {
        return Reservation::query()
            ->with(self::RESPONSE_RELATIONS)
            ->where($column, $userId)
            ->whereIn('reservation_status', ['completed', 'cancelled', 'rejected'])
            ->latest();
    }
}
