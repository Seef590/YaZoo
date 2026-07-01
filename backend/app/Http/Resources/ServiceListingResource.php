<?php

namespace App\Http\Resources;

use App\Models\ServiceListing;
use App\Support\MediaStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ServiceListing
 */
class ServiceListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'animalTypes' => $this->animal_types ?? [],
            'city' => $this->city,
            'address' => $this->address,
            'price' => $this->price !== null ? (float) $this->price : null,
            'priceType' => $this->price_type,
            'availability' => $this->availability ?? [],
            'contactPhone' => $this->contact_phone,
            'contactEmail' => $this->contact_email,
            'whatsappEnabled' => (bool) $this->whatsapp_enabled,
            'status' => $this->status,
            'media' => $this->media ?? [],
            'viewsCount' => $this->views_count,
            'reservationsCount' => $this->reservations_count,
            'moderationStatus' => $this->moderation_status ?? 'active',
            'moderationNote' => $this->when(
                ($request->user()?->is_admin ?? false) || ($request->user()?->is($this->user) ?? false),
                $this->moderation_note,
            ),
            'createdAt' => $this->created_at?->toISOString(),
            'provider' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $this->user?->publicEmail(),
                'phone' => $this->user?->phone,
                'avatar' => MediaStorage::resolveUrl($this->user?->avatar),
                'city' => $this->user?->city,
                'country' => $this->user?->country,
            ],
            'isOwner' => $request->user()?->is($this->user) ?? false,
        ];
    }
}
