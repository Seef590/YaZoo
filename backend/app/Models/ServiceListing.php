<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceListing extends Model
{
    use HasFactory, SoftDeletes;

    public const TYPES = [
        'pet_sitting',
        'training',
    ];

    public const PRICE_TYPES = [
        'fixed',
        'hourly',
        'daily',
        'session',
        'negotiable',
    ];

    public const STATUSES = [
        'draft',
        'active',
        'paused',
        'rejected',
        'archived',
    ];

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'description',
        'animal_types',
        'city',
        'address',
        'price',
        'price_type',
        'availability',
        'contact_phone',
        'contact_email',
        'whatsapp_enabled',
        'status',
        'media',
        'views_count',
        'reservations_count',
    ];

    protected function casts(): array
    {
        return [
            'animal_types' => 'array',
            'availability' => 'array',
            'media' => 'array',
            'price' => 'decimal:2',
            'whatsapp_enabled' => 'boolean',
            'views_count' => 'integer',
            'reservations_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reservations(): MorphMany
    {
        return $this->morphMany(Reservation::class, 'reservable');
    }
}
