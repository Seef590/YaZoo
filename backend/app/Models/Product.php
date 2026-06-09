<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Product extends Model
{
    use HasFactory;

    public const CATEGORIES = [
        'food',
        'toy',
        'accessory',
        'hygiene',
        'health',
        'habitat',
        'other',
    ];

    public const LISTING_STATUSES = [
        'available',
        'reserved',
        'sold',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'category',
        'description',
        'price',
        'image_url',
        'gallery_urls',
        'location',
        'stock',
        'listing_status',
        'condition_status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'gallery_urls' => 'array',
            'price' => 'decimal:2',
            'stock' => 'integer',
        ];
    }

    /**
     * Get the author of the product listing.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reservations for this product listing.
     */
    public function reservations(): MorphMany
    {
        return $this->morphMany(Reservation::class, 'reservable');
    }
}
