<?php

namespace App\Http\Resources\Marketplace;

use App\Models\Animal;
use App\Support\MarketplaceMedia;
use App\Support\MediaStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Animal
 */
class AnimalResource extends JsonResource
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
            'name' => $this->name,
            'category' => $this->category,
            'type' => $this->type,
            'breed' => $this->breed,
            'age' => $this->age,
            'sex' => $this->sex,
            'location' => $this->location,
            'contactPhone' => $this->contact_phone,
            'photoPath' => $this->photo_url,
            'photoUrl' => MarketplaceMedia::resolveUrl($this->photo_url),
            'galleryPaths' => $this->gallery_urls ?? [],
            'galleryUrls' => MarketplaceMedia::resolveUrls($this->gallery_urls),
            'price' => $this->price !== null ? (float) $this->price : null,
            'isForAdoption' => (bool) $this->is_for_adoption,
            'listingStatus' => $this->listing_status,
            'description' => $this->description,
            'acceptsAnimalRules' => (bool) $this->accepts_animal_rules,
            'createdAt' => $this->created_at?->toISOString(),
            'author' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $this->user?->publicEmail(),
                'phone' => $this->user?->phone,
                'isPhoneVerified' => $this->user?->hasVerifiedPhone() ?? false,
                'avatar' => MediaStorage::resolveUrl($this->user?->avatar),
                'city' => $this->user?->city,
                'country' => $this->user?->country,
            ],
            'isOwner' => $request->user()?->is($this->user) ?? false,
        ];
    }
}
