<?php

namespace App\Http\Resources\Profile;

use App\Models\User;
use App\Support\MediaStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $canViewPrivateDetails = $request->user()?->is($this->resource)
            || (bool) $request->user()?->is_admin;
        $viewer = $request->user();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $canViewPrivateDetails ? $this->publicEmail() : null,
            'phone' => $canViewPrivateDetails ? $this->phone : null,
            'country' => $this->country,
            'city' => $this->city,
            'bio' => $this->bio,
            'avatar' => MediaStorage::resolveUrl($this->avatar),
            'coverPhoto' => MediaStorage::resolveUrl($this->cover_photo),
            'postsCount' => $this->posts_count ?? 0,
            'followersCount' => $this->followers_count ?? 0,
            'followingCount' => $this->following_count ?? 0,
            'animalsCount' => $this->animals_count ?? 0,
            'productsCount' => $this->products_count ?? 0,
            'ratingCount' => $this->reviews_received_count ?? 0,
            'ratingAverage' => $this->reviews_received_avg_rating !== null
                ? round((float) $this->reviews_received_avg_rating, 1)
                : null,
            'isPhoneVerified' => $this->hasVerifiedPhone(),
            'isFollowing' => $viewer
                ? $this->followers()->where('follower_user_id', $viewer->id)->exists()
                : false,
            'preferredLocale' => $this->preferred_locale ?? 'fr',
            'joinedAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'isOwner' => $request->user()?->is($this->resource) ?? false,
        ];
    }
}
