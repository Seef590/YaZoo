<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrivacyConsent extends Model
{
    use HasFactory;

    public const TYPES = [
        'cookies_necessary',
        'cookies_analytics',
        'sms_otp',
        'marketing',
        'geolocation',
        'cgu',
        'privacy',
    ];

    protected $fillable = [
        'user_id',
        'type',
        'accepted',
        'locale',
        'ip_hash',
        'user_agent_hash',
        'accepted_at',
    ];

    protected function casts(): array
    {
        return [
            'accepted' => 'boolean',
            'accepted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
