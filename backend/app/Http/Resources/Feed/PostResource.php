<?php

namespace App\Http\Resources\Feed;

use App\Models\Post;
use App\Support\MediaStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Post
 */
class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $resolvedMediaPath = $this->media_path ?: $this->image_path;
        $resolvedMediaKind = $this->media_kind ?: ($resolvedMediaPath ? 'image' : null);

        return [
            'id' => $this->id,
            'content' => $this->content,
            'imageUrl' => $resolvedMediaKind === 'image'
                ? MediaStorage::resolveUrl($resolvedMediaPath)
                : null,
            'mediaUrl' => MediaStorage::resolveUrl($resolvedMediaPath),
            'mediaKind' => $resolvedMediaKind,
            'location' => $this->location,
            'tags' => $this->tags ?? [],
            'createdAt' => $this->created_at?->toISOString(),
            'author' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'avatar' => MediaStorage::resolveUrl($this->user?->avatar),
                'city' => $this->user?->city,
                'country' => $this->user?->country,
            ],
            'likes' => $this->likes_count ?? 0,
            'liked' => (bool) ($this->liked_by_user ?? false),
            'commentsCount' => $this->comments_count ?? 0,
            'comments' => CommentResource::collection($this->whenLoaded('comments')),
        ];
    }
}
