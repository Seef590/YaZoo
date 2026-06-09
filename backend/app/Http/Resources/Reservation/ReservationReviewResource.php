<?php

namespace App\Http\Resources\Reservation;

use App\Models\ReservationReview;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ReservationReview
 */
class ReservationReviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'createdAt' => $this->created_at?->toISOString(),
            'reviewer' => [
                'id' => $this->reviewer?->id,
                'name' => $this->reviewer?->name,
                'avatar' => $this->reviewer?->avatar,
            ],
            'reviewee' => [
                'id' => $this->reviewee?->id,
                'name' => $this->reviewee?->name,
                'avatar' => $this->reviewee?->avatar,
            ],
        ];
    }
}
