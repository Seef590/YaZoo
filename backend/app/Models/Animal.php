<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Animal extends Model
{
    use HasFactory;

    public const CATEGORIES = [
        'dog',
        'cat',
        'bird',
        'fish',
        'rabbit',
        'reptile',
        'other',
    ];

    public const LISTING_STATUSES = [
        'available',
        'reserved',
        'adopted',
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
        'type',
        'breed',
        'age',
        'sex',
        'location',
        'photo_url',
        'gallery_urls',
        'price',
        'is_for_adoption',
        'listing_status',
        'description',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'age' => 'integer',
            'gallery_urls' => 'array',
            'price' => 'decimal:2',
            'is_for_adoption' => 'boolean',
        ];
    }

    /**
     * Get the author of the animal listing.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reservations for this animal listing.
     */
    public function reservations(): MorphMany
    {
        return $this->morphMany(Reservation::class, 'reservable');
    }
}
