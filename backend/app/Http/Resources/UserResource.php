<?php

namespace App\Http\Resources;

use App\Models\User;
use App\Support\MediaStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $canViewPrivateDetails = $request->user()?->is($this->resource)
            || (bool) $request->user()?->is_admin;

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
            'isAdmin' => (bool) $this->is_admin,
            'isPhoneVerified' => $this->hasVerifiedPhone(),
            'preferredLocale' => $this->preferred_locale ?? 'fr',
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
