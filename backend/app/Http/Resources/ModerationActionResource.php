<?php

namespace App\Http\Resources;

use App\Models\Animal;
use App\Models\ModerationAction;
use App\Models\Post;
use App\Models\Product;
use App\Models\ProfessionalVerification;
use App\Models\Report;
use App\Models\ServiceListing;
use App\Models\User;
use App\Models\Veterinarian;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ModerationAction
 */
class ModerationActionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'targetType' => $this->frontendType($this->target_type),
            'targetClass' => $this->target_type,
            'targetId' => $this->target_id,
            'reason' => $this->reason,
            'metadata' => $this->metadata ?? [],
            'createdAt' => $this->created_at?->toISOString(),
            'admin' => [
                'id' => $this->admin?->id,
                'name' => $this->admin?->name,
                'email' => $this->admin?->publicEmail(),
            ],
        ];
    }

    private function frontendType(?string $class): string
    {
        return match ($class) {
            User::class => 'user',
            Animal::class => 'animal',
            Product::class => 'product',
            ServiceListing::class => 'service',
            Veterinarian::class => 'veterinarian',
            Post::class => 'post',
            Report::class => 'report',
            ProfessionalVerification::class => 'professional_verification',
            default => 'content',
        };
    }
}
