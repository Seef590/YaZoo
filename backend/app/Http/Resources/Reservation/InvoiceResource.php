<?php

namespace App\Http\Resources\Reservation;

use App\Models\Animal;
use App\Models\Product;
use App\Models\Reservation;
use App\Support\MarketplaceMedia;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Reservation
 */
class InvoiceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'reservationId' => $this->id,
            'invoiceNumber' => $this->invoice_number,
            'invoiceIssuedAt' => $this->invoice_issued_at?->toISOString(),
            'reservationStatus' => $this->reservation_status,
            'paymentStatus' => $this->payment_status,
            'paymentMethod' => $this->payment_method,
            'deliveryMethod' => $this->delivery_method,
            'deliveryStatus' => $this->delivery_status,
            'quantity' => $this->quantity,
            'subtotal' => $this->total_price !== null ? (float) $this->total_price : null,
            'deliveryFee' => $this->delivery_fee !== null ? (float) $this->delivery_fee : null,
            'grandTotal' => $this->grandTotal(),
            'createdAt' => $this->created_at?->toISOString(),
            'completedAt' => $this->completed_at?->toISOString(),
            'buyer' => [
                'name' => $this->buyer?->name,
                'email' => $this->buyer?->publicEmail(),
                'phone' => $this->buyer?->phone,
                'city' => $this->buyer?->city,
                'country' => $this->buyer?->country,
            ],
            'seller' => [
                'name' => $this->seller?->name,
                'email' => $this->seller?->publicEmail(),
                'phone' => $this->seller?->phone,
                'city' => $this->seller?->city,
                'country' => $this->seller?->country,
            ],
            'listing' => [
                'kind' => $this->listingKind(),
                'title' => $this->listingTitle(),
                'imageUrl' => $this->listingImageUrl(),
                'location' => $this->reservable?->location,
            ],
            'delivery' => [
                'contactName' => $this->delivery_contact_name,
                'phone' => $this->delivery_phone,
                'city' => $this->delivery_city,
                'address' => $this->delivery_address,
                'notes' => $this->delivery_notes,
            ],
        ];
    }

    protected function grandTotal(): ?float
    {
        if ($this->total_price === null) {
            return null;
        }

        return (float) $this->total_price + (float) ($this->delivery_fee ?? 0);
    }

    protected function listingKind(): string
    {
        return match ($this->reservable_type) {
            Animal::class => 'animal',
            Product::class => 'product',
            default => 'listing',
        };
    }

    protected function listingTitle(): string
    {
        if ($this->reservable instanceof Animal || $this->reservable instanceof Product) {
            return $this->reservable->name;
        }

        return 'Annonce';
    }

    protected function listingImageUrl(): ?string
    {
        if ($this->reservable instanceof Animal) {
            return MarketplaceMedia::resolveUrl($this->reservable->photo_url);
        }

        if ($this->reservable instanceof Product) {
            return MarketplaceMedia::resolveUrl($this->reservable->image_url);
        }

        return null;
    }
}
