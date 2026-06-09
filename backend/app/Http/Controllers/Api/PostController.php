<?php

namespace App\Http\Controllers\Api;

use App\DTOs\PaginationData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Feed\StorePostRequest;
use App\Http\Resources\Feed\PostResource;
use App\Models\Post;
use App\Notifications\PostLikedNotification;
use App\Support\MediaStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Display a paginated listing of posts for the feed.
     */
    public function index(Request $request)
    {
        $pagination = PaginationData::fromRequest($request, 10, 30);

        $posts = Post::query()
            ->with([
                'user:id,name,avatar,city,country',
                'comments' => fn ($query) => $query
                    ->latest()
                    ->limit(3)
                    ->with('user:id,name,avatar,city,country'),
            ])
            ->withCount([
                'likes',
                'comments',
                'likes as liked_by_user' => fn ($query) => $query->where(
                    'user_id',
                    $request->user()->id,
                ),
            ])
            ->latest()
            ->paginate($pagination->perPage);

        return PostResource::collection($posts);
    }

    /**
     * Store a newly created post.
     */
    public function store(StorePostRequest $request): JsonResponse
    {
        $this->authorize('create', Post::class);

        $mediaPath = null;
        $mediaKind = null;

        if ($request->hasFile('media_file')) {
            $mediaPath = MediaStorage::storeUploadedFile(
                $request->file('media_file'),
                'feed/posts',
            );
            $mediaKind = MediaStorage::detectMediaKind($request->file('media_file'));
        }

        $post = $request->user()->posts()->create([
            'content' => $request->validated('content'),
            'image_path' => $mediaKind === 'image' ? $mediaPath : null,
            'media_path' => $mediaPath,
            'media_kind' => $mediaKind,
            'location' => $request->validated('location'),
            'tags' => $request->validated('tags', []),
        ]);

        $this->loadFeedRelations($post, $request->user()->id);

        return PostResource::make($post)
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Toggle the current user's like on a post.
     */
    public function toggleLike(Request $request, Post $post): JsonResponse
    {
        $this->authorize('interact', $post);

        $existingLike = $post->likes()
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existingLike) {
            $existingLike->delete();
        } else {
            $post->likes()->create([
                'user_id' => $request->user()->id,
            ]);

            $post->loadMissing('user');

            if ($post->user && ! $request->user()->is($post->user)) {
                $post->user->notify(new PostLikedNotification($post, $request->user()));
            }
        }

        $post->refresh();
        $this->loadFeedRelations($post, $request->user()->id);

        return PostResource::make($post)->response();
    }

    /**
     * Load the relationships and counters needed by the frontend feed.
     */
    protected function loadFeedRelations(Post $post, int $userId): void
    {
        $post->load([
            'user:id,name,avatar,city,country',
            'comments' => fn ($query) => $query
                ->latest()
                ->limit(3)
                ->with('user:id,name,avatar,city,country'),
        ])->loadCount([
            'likes',
            'comments',
            'likes as liked_by_user' => fn ($query) => $query->where('user_id', $userId),
        ]);
    }
}
