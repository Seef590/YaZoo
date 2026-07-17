<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModerationAction extends Model
{
    use HasFactory;

    public const ACTIONS = [
        'approve',
        'reject',
        'hide',
        'restore',
        'suspend',
        'unsuspend',
        'ban',
        'unban',
        'review_report',
        'approve_document',
        'reject_document',
        'approve_animal',
        'reject_animal',
        'suspend_animal',
        'restore_animal',
        'update_report_status',
        'update_professional_verification',
        'download_professional_verification_document',
        'update_delete_request',
    ];

    protected $fillable = [
        'admin_id',
        'action',
        'target_type',
        'target_id',
        'reason',
        'metadata',
        'ip_hash',
        'user_agent_hash',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
