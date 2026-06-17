<?php

namespace App\Http\Resources;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ActivityLog
 */
class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'category' => $this->category,
            'description' => $this->description,
            'metadata' => $this->metadata ?? [],
            'createdAt' => $this->created_at?->toISOString(),
            'actor' => [
                'id' => $this->actor?->id,
                'name' => $this->actor?->name,
            ],
            'user' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
            ],
            'subject' => [
                'type' => $this->subject_type,
                'id' => $this->subject_id,
            ],
        ];
    }
}
