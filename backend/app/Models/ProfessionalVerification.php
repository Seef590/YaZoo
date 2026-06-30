<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfessionalVerification extends Model
{
    use HasFactory;

    public const BUSINESS_TYPES = [
        'veterinarian',
        'pet_shop',
        'breeder',
        'shelter',
        'service_provider',
        'association',
        'other',
    ];

    public const STATUSES = [
        'pending',
        'approved',
        'rejected',
    ];

    protected $fillable = [
        'user_id',
        'business_type',
        'legal_name',
        'ice',
        'onssa_authorization_number',
        'professional_license_number',
        'document_path',
        'status',
        'verified_by',
        'verified_at',
        'admin_note',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
