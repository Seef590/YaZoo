<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reservation\StoreReservationReviewRequest;
use App\Http\Resources\Reservation\ReservationResource;
use App\Models\Reservation;
use App\Models\ReservationReview;
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

        abort_if($revieweeId === $reviewer->id, 422, __('messages.reviews.self_forbidden'));

        $reviewable = ReservationReview::supportsReviewableType($reservation->reservable_type)
            ? [
                'reviewable_type' => $reservation->reservable_type,
                'reviewable_id' => $reservation->reservable_id,
            ]
            : [
                'reviewable_type' => null,
                'reviewable_id' => null,
            ];

        $reservation->reviews()->create([
            'reviewer_id' => $reviewer->id,
            'reviewee_id' => $revieweeId,
            ...$reviewable,
            'rating' => (int) $request->validated('rating'),
            'comment' => $request->validated('comment'),
            'status' => ReservationReview::STATUS_PUBLISHED,
        ]);

        $relations = [
            'reviews.reviewer:id,name,avatar',
            'reviews.reviewee:id,name,avatar',
            'buyer:id,name,email,phone,avatar',
            'seller:id,name,email,phone,avatar',
        ];

        $relations[] = ReservationReview::supportsReviewableType($reservation->reservable_type)
            ? 'reservable.user:id,name,email,phone,avatar,city,country'
            : 'reservable';

        $reservation->refresh()->load($relations);

        return response()->json([
            'message' => __('messages.reviews.created'),
            'data' => ReservationResource::make($reservation)->resolve(),
        ], 201);
    }
}
