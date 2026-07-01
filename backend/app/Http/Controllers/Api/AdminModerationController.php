<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Comment;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\Like;
use App\Models\Post;
use App\Models\Product;
use App\Models\User;
use App\Support\MarketplaceMedia;
use App\Support\MediaStorage;
use App\Services\Admin\ModerationLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdminModerationController extends Controller
{
    public function __construct(
        private readonly ModerationLogger $logger,
    ) {}

    /**
     * Display the global moderation dashboard for admins.
     */
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        return response()->json(Cache::remember(
            'admin:moderation-dashboard:v1',
            now()->addSeconds(30),
            fn (): array => $this->dashboardPayload(),
        ));
    }

    /**
     * Build the moderation dashboard payload.
     *
     * @return array<string, mixed>
     */
    protected function dashboardPayload(): array
    {
        $posts = Post::query()
            ->with('user:id,name,email,avatar')
            ->withCount(['likes', 'comments'])
            ->latest()
            ->take(12)
            ->get()
            ->map(function (Post $post): array {
                $resolvedMediaPath = $post->media_path ?: $post->image_path;
                $resolvedMediaKind = $post->media_kind ?: ($resolvedMediaPath ? 'image' : null);

                return [
                    'id' => $post->id,
                    'title' => Str::limit($post->content ?: 'Post sans texte', 80),
                    'content' => $post->content,
                    'location' => $post->location,
                    'imageUrl' => $resolvedMediaKind === 'image'
                        ? MediaStorage::resolveUrl($resolvedMediaPath)
                        : null,
                    'mediaUrl' => MediaStorage::resolveUrl($resolvedMediaPath),
                    'mediaKind' => $resolvedMediaKind,
                    'tags' => $post->tags ?? [],
                    'moderationStatus' => $post->moderation_status ?? 'active',
                    'moderationNote' => $post->moderation_note,
                    'likes' => $post->likes_count ?? 0,
                    'commentsCount' => $post->comments_count ?? 0,
                    'createdAt' => $post->created_at?->toISOString(),
                    'author' => $this->formatAuthor($post->user),
                ];
            })
            ->values()
            ->all();

        $animals = Animal::query()
            ->with('user:id,name,email,avatar')
            ->latest()
            ->take(12)
            ->get()
            ->map(function (Animal $animal): array {
                return [
                    'id' => $animal->id,
                    'title' => $animal->name,
                    'category' => $animal->category,
                    'listingStatus' => $animal->listing_status,
                    'location' => $animal->location,
                    'price' => $animal->price !== null ? (float) $animal->price : null,
                    'isForAdoption' => (bool) $animal->is_for_adoption,
                    'moderationStatus' => $animal->legal_status ?? 'pending_review',
                    'moderationNote' => $animal->moderation_note,
                    'imageUrl' => MarketplaceMedia::resolveUrl($animal->photo_url),
                    'createdAt' => $animal->created_at?->toISOString(),
                    'author' => $this->formatAuthor($animal->user),
                ];
            })
            ->values()
            ->all();

        $products = Product::query()
            ->with('user:id,name,email,avatar')
            ->latest()
            ->take(12)
            ->get()
            ->map(function (Product $product): array {
                return [
                    'id' => $product->id,
                    'title' => $product->name,
                    'category' => $product->category,
                    'listingStatus' => $product->listing_status,
                    'conditionStatus' => $product->condition_status,
                    'location' => $product->location,
                    'price' => (float) $product->price,
                    'stock' => $product->stock,
                    'moderationStatus' => $product->moderation_status ?? 'active',
                    'moderationNote' => $product->moderation_note,
                    'imageUrl' => MarketplaceMedia::resolveUrl($product->image_url),
                    'createdAt' => $product->created_at?->toISOString(),
                    'author' => $this->formatAuthor($product->user),
                ];
            })
            ->values()
            ->all();

        $communities = Community::query()
            ->with('user:id,name,email,avatar')
            ->withCount([
                'approvedMemberships as members_count',
                'pendingMemberships as pending_requests_count',
            ])
            ->latest()
            ->take(12)
            ->get()
            ->map(function (Community $community): array {
                return [
                    'id' => $community->id,
                    'title' => $community->name,
                    'description' => $community->description,
                    'imageUrl' => $community->image_url,
                    'isPrivate' => (bool) $community->is_private,
                    'membersCount' => $community->members_count ?? 0,
                    'pendingRequestsCount' => $community->pending_requests_count ?? 0,
                    'createdAt' => $community->created_at?->toISOString(),
                    'author' => $this->formatAuthor($community->user),
                ];
            })
            ->values()
            ->all();

        return [
            'stats' => [
                'users' => User::query()->count(),
                'admins' => User::query()->where('is_admin', true)->count(),
                'posts' => Post::query()->count(),
                'animals' => Animal::query()->count(),
                'products' => Product::query()->count(),
                'communities' => Community::query()->count(),
                'pendingCommunityRequests' => CommunityMember::query()
                    ->where('status', 'pending')
                    ->count(),
            ],
            'posts' => $posts,
            'animals' => $animals,
            'products' => $products,
            'communities' => $communities,
        ];
    }

    /**
     * Delete a post from the moderation dashboard.
     */
    public function destroyPost(Request $request, Post $post): JsonResponse
    {
        $this->ensureAdmin($request);
        $this->logger->log($request, 'hide', $post, 'Suppression admin existante via tableau de moderation.', [
            'operation' => 'delete_post',
        ]);

        MarketplaceMedia::deleteStoredFiles([$post->image_path]);
        Comment::query()->where('post_id', $post->id)->delete();
        Like::query()
            ->where('likeable_type', Post::class)
            ->where('likeable_id', $post->id)
            ->delete();
        $post->delete();

        return response()->json([
            'message' => __('messages.admin.post_deleted'),
        ]);
    }

    /**
     * Delete an animal listing from the moderation dashboard.
     */
    public function destroyAnimal(Request $request, Animal $animal): JsonResponse
    {
        $this->ensureAdmin($request);
        $this->logger->log($request, 'suspend_animal', $animal, 'Suppression admin existante via tableau de moderation.', [
            'operation' => 'delete_animal',
        ]);

        MarketplaceMedia::deleteStoredFiles([
            $animal->photo_url,
            ...($animal->gallery_urls ?? []),
        ]);

        $animal->reservations()->delete();
        $animal->delete();

        return response()->json([
            'message' => __('messages.admin.animal_deleted'),
        ]);
    }

    /**
     * Delete a product listing from the moderation dashboard.
     */
    public function destroyProduct(Request $request, Product $product): JsonResponse
    {
        $this->ensureAdmin($request);
        $this->logger->log($request, 'hide', $product, 'Suppression admin existante via tableau de moderation.', [
            'operation' => 'delete_product',
        ]);

        MarketplaceMedia::deleteStoredFiles([
            $product->image_url,
            ...($product->gallery_urls ?? []),
        ]);

        $product->reservations()->delete();
        $product->delete();

        return response()->json([
            'message' => __('messages.admin.product_deleted'),
        ]);
    }

    /**
     * Delete a community from the moderation dashboard.
     */
    public function destroyCommunity(Request $request, Community $community): JsonResponse
    {
        $this->ensureAdmin($request);
        $this->logger->log($request, 'hide', $community, 'Suppression admin existante via tableau de moderation.', [
            'operation' => 'delete_community',
        ]);

        $community->delete();

        return response()->json([
            'message' => __('messages.admin.community_deleted'),
        ]);
    }

    /**
     * Ensure the current user is a platform admin.
     */
    protected function ensureAdmin(Request $request): void
    {
        abort_unless(
            (bool) $request->user()?->is_admin,
            403,
            'Acces reserve aux admins.',
        );
    }

    /**
     * Format a simple author payload for the moderation dashboard.
     *
     * @return array<string, mixed>
     */
    protected function formatAuthor(?User $user): array
    {
        return [
            'id' => $user?->id,
            'name' => $user?->name,
            'email' => $user?->email,
            'avatar' => MediaStorage::resolveUrl($user?->avatar),
        ];
    }
}
