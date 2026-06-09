<?php

namespace App\Http\Resources\Feed;

use App\Models\Story;
use App\Support\MediaStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Story
 */
class StoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isOwner = $request->user()?->is($this->user) ?? false;
        $viewerId = $request->user()?->id;
        $viewerEntry = $viewerId ? $this->views?->firstWhere('user_id', $viewerId) : null;

        return [
            'id' => $this->id,
            'content' => $this->content,
            'mediaUrl' => MediaStorage::resolveUrl($this->media_path),
            'mediaKind' => $this->media_kind,
            'location' => $this->location,
            'createdAt' => $this->created_at?->toISOString(),
            'expiresAt' => $this->expires_at?->toISOString(),
            'remainingSeconds' => max(0, now()->diffInSeconds($this->expires_at, false)),
            'isOwn' => $isOwner,
            'isViewed' => $isOwner ? true : $viewerEntry !== null,
            'viewedAt' => $viewerEntry?->viewed_at?->toISOString(),
            'viewsCount' => $this->views_count ?? $this->views?->count() ?? 0,
            'viewers' => $isOwner
                ? $this->views
                    ->filter(fn ($view) => $view->user !== null)
                    ->map(fn ($view) => [
                        'id' => $view->user?->id,
                        'name' => $view->user?->name,
                        'avatar' => MediaStorage::resolveUrl($view->user?->avatar),
                        'viewedAt' => $view->viewed_at?->toISOString(),
                    ])
                    ->values()
                    ->all()
                : [],
        ];
    }
}
