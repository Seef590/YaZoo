<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reservation\StoreReservationReviewRequest;
use App\Http\Resources\Reservation\ReservationResource;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;

class ReservationReviewController extends Controller
{
    /**
     * Store a review for a completed reservation.
     */
    public function store(StoreReservationReviewRequest $request, Reservation $reservation): JsonResponse
    {
        $reservation->loadMissing('reviews');

        $reviewer = $request->user();
        abort_unless($reviewer !== null, 401);
        abort_unless($reviewer->id === $reservation->buyer_id || $reviewer->id === $reservation->seller_id, 403);
        abort_if($reservation->reservation_status !== 'completed', 422, __('messages.reviews.only_after_completion'));
        abort_if(
            $reservation->reviews()->where('reviewer_id', $reviewer->id)->exists(),
            422,
            __('messages.reviews.already_submitted'),
        );

        $revieweeId = $reviewer->id === $reservation->buyer_id
            ? $reservation->seller_id
            : $reservation->buyer_id;

        $reservation->reviews()->create([
            'reviewer_id' => $reviewer->id,
            'reviewee_id' => $revieweeId,
            'rating' => (int) $request->validated('rating'),
            'comment' => $request->validated('comment'),
        ]);

        $reservation->refresh()->load([
            'reviews.reviewer:id,name,avatar',
            'reviews.reviewee:id,name,avatar',
            'buyer:id,name,email,phone,avatar',
            'seller:id,name,email,phone,avatar',
            'reservable.user:id,name,email,phone,avatar,city,country',
        ]);

        return response()->json([
            'message' => __('messages.reviews.created'),
            'data' => ReservationResource::make($reservation)->resolve(),
        ], 201);
    }
}
