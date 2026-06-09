<?php

namespace App\Repositories;

use App\Models\Story;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class StoryRepository
{
    public function activeUserGroups(User $viewer, int $perPage): LengthAwarePaginator
    {
        return Story::query()
            ->active()
            ->select('user_id')
            ->selectRaw('MAX(created_at) as last_story_at')
            ->groupBy('user_id')
            ->orderByRaw('MAX(CASE WHEN user_id = ? THEN 1 ELSE 0 END) DESC', [$viewer->id])
            ->orderByDesc('last_story_at')
            ->paginate($perPage);
    }

    /**
     * @param  array<int, int>  $userIds
     * @return EloquentCollection<int, Story>
     */
    public function activeStoriesForUsers(array $userIds, int $viewerId, int $limit): EloquentCollection
    {
        if ($userIds === []) {
            return new EloquentCollection;
        }

        return Story::query()
            ->active()
            ->whereIn('user_id', $userIds)
            ->with([
                'user:id,name,avatar,city,country',
                'views' => fn ($query) => $query
                    ->select('id', 'story_id', 'user_id', 'viewed_at')
                    ->where('user_id', $viewerId),
                'views.user:id,name,avatar',
            ])
            ->withCount('views')
            ->orderBy('created_at')
            ->limit($limit)
            ->get();
    }

    public function loadStoryForResponse(Story $story): Story
    {
        return $story->load([
            'user:id,name,avatar,city,country',
            'views.user:id,name,avatar',
        ])->loadCount('views');
    }
}
