<?php

namespace App\Http\Controllers\Api;

use App\DTOs\PaginationData;
use App\Http\Controllers\Controller;
use App\Http\Resources\Reservation\ReservationReviewResource;
use App\Models\ReservationReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminReservationReviewController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', Rule::in(ReservationReview::STATUSES)],
        ]);
        $pagination = PaginationData::fromRequest($request, 20, 100);

        $reviews = ReservationReview::query()
            ->with(['reviewer:id,name,avatar', 'reviewee:id,name,avatar', 'reservation'])
            ->when($validated['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->latest()
            ->paginate($pagination->perPage);

        return ReservationReviewResource::collection($reviews);
    }

    public function updateStatus(Request $request, ReservationReview $reservationReview): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(ReservationReview::STATUSES)],
            'moderation_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $reservationReview->update([
            'status' => $validated['status'],
            'moderation_reason' => $validated['moderation_reason'] ?? null,
            'moderated_by' => $request->user()->id,
            'moderated_at' => now(),
        ]);

        return response()->json([
            'review' => ReservationReviewResource::make(
                $reservationReview->fresh(['reviewer:id,name,avatar', 'reviewee:id,name,avatar']),
            )->resolve($request),
        ]);
    }
}
