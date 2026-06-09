<?php

namespace App\Http\Resources\Community;

use App\Models\CommunityMember;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin CommunityMember
 */
class CommunityMembershipRequestResource extends JsonResource
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
            'status' => $this->status,
            'role' => $this->role,
            'requestedAt' => $this->created_at?->toISOString(),
            'user' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $this->user?->email,
                'avatar' => $this->user?->avatar,
                'city' => $this->user?->city,
                'country' => $this->user?->country,
            ],
        ];
    }
}
