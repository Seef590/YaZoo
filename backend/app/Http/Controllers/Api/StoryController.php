<?php

namespace App\Http\Controllers\Api;

use App\DTOs\PaginationData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Feed\StoreStoryRequest;
use App\Http\Resources\Feed\StoryGroupResource;
use App\Http\Resources\Feed\StoryResource;
use App\Models\Story;
use App\Services\StoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoryController extends Controller
{
    public function __construct(
        protected StoryService $stories,
    ) {}

    public function index(Request $request)
    {
        $pagination = PaginationData::fromRequest($request, 12, 30);
        $result = $this->stories->activeGroups($request->user(), $pagination->perPage);

        return StoryGroupResource::collection($result['groups'])
            ->additional(['meta' => $result['meta']]);
    }

    public function store(StoreStoryRequest $request): JsonResponse
    {
        $this->authorize('create', Story::class);

        $story = $this->stories->create(
            $request->user(),
            $request->validated(),
            $request->file('media_file'),
        );

        return response()->json([
            'message' => 'Story ajoutee avec succes.',
            'data' => StoryResource::make($story)->resolve($request),
        ], 201);
    }

    public function markAsViewed(Request $request, Story $story): JsonResponse
    {
        $this->authorize('view', $story);

        return response()->json([
            'message' => 'Story marquee comme vue.',
            'data' => StoryResource::make(
                $this->stories->markAsViewed($request->user(), $story),
            )->resolve($request),
        ]);
    }

    public function destroy(Story $story): JsonResponse
    {
        $this->authorize('delete', $story);
        $this->stories->delete($story);

        return response()->json([
            'message' => 'Story supprimee avec succes.',
        ]);
    }
}
