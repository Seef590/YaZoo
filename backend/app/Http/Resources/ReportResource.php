<?php

namespace App\Http\Resources;

use App\Models\Animal;
use App\Models\Post;
use App\Models\Product;
use App\Models\ServiceListing;
use App\Models\Veterinarian;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reportableType' => $this->frontendType($this->reportable_type),
            'reportableId' => $this->reportable_id,
            'reason' => $this->reason,
            'details' => $this->details,
            'status' => $this->status,
            'reporter' => [
                'id' => $this->reporter?->id,
                'name' => $this->reporter?->name,
                'email' => $this->reporter?->publicEmail(),
            ],
            'reviewer' => [
                'id' => $this->reviewer?->id,
                'name' => $this->reviewer?->name,
            ],
            'reviewedAt' => $this->reviewed_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }

    protected function frontendType(?string $class): string
    {
        return match ($class) {
            Animal::class => 'animal',
            Product::class => 'product',
            ServiceListing::class => 'service',
            Veterinarian::class => 'veterinarian',
            Post::class => 'post',
            default => 'content',
        };
    }
}
