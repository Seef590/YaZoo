<?php

namespace App\Http\Resources\Feed;

use App\Support\MediaStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoryGroupResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) ($this['id'] ?? ''),
            'isOwn' => (bool) ($this['is_own'] ?? false),
            'hasUnviewed' => (bool) ($this['has_unviewed'] ?? false),
            'lastStoryAt' => $this['last_story_at']?->toISOString(),
            'user' => [
                'id' => $this['user']?->id,
                'name' => $this['user']?->name,
                'avatar' => MediaStorage::resolveUrl($this['user']?->avatar),
                'city' => $this['user']?->city,
                'country' => $this['user']?->country,
            ],
            'stories' => StoryResource::collection($this['stories']),
        ];
    }
}
