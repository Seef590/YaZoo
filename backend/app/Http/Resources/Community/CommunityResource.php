<?php

namespace App\Http\Resources\Community;

use App\Models\Community;
use App\Support\MediaStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Community
 */
class CommunityResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $viewerMembership = $this->whenLoaded('memberships', fn () => $this->memberships->first());
        $isOwner = $request->user()?->is($this->user) ?? false;
        $isApprovedAdmin = $viewerMembership?->role === 'admin'
            && $viewerMembership?->status === 'approved';

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'imageUrl' => MediaStorage::resolveUrl($this->image_url),
            'isPrivate' => (bool) $this->is_private,
            'createdAt' => $this->created_at?->toISOString(),
            'owner' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'avatar' => MediaStorage::resolveUrl($this->user?->avatar),
            ],
            'membersCount' => $this->members_count ?? 0,
            'pendingRequestsCount' => $this->pending_requests_count ?? 0,
            'membershipStatus' => $viewerMembership?->status,
            'currentUserRole' => $viewerMembership?->role,
            'isMember' => $viewerMembership?->status === 'approved',
            'isAdmin' => $isOwner || $isApprovedAdmin,
            'canManageRequests' => $isOwner || $isApprovedAdmin,
            'isOwner' => $isOwner,
        ];
    }
}
