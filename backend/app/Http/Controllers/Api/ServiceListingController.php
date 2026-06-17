<?php

namespace App\Http\Controllers\Api;

use App\DTOs\PaginationData;
use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceListing\StoreServiceListingRequest;
use App\Http\Requests\ServiceListing\UpdateServiceListingRequest;
use App\Http\Resources\ServiceListingResource;
use App\Models\ServiceListing;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceListingController extends Controller
{
    public function __construct(
        protected ActivityLogger $activityLogger,
    ) {}

    public function index(Request $request)
    {
        $pagination = PaginationData::fromRequest($request, 12, 50);

        $query = ServiceListing::query()
            ->with('user:id,name,email,phone,avatar,city,country')
            ->where('status', 'active')
            ->latest();

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->filled('city')) {
            $query->where('city', 'like', '%'.$request->string('city').'%');
        }

        return ServiceListingResource::collection($query->paginate($pagination->perPage));
    }

    public function mine(Request $request)
    {
        $pagination = PaginationData::fromRequest($request, 12, 50);

        return ServiceListingResource::collection(
            ServiceListing::query()
                ->with('user:id,name,email,phone,avatar,city,country')
                ->where('user_id', $request->user()->id)
                ->latest()
                ->paginate($pagination->perPage),
        );
    }

    public function types(): JsonResponse
    {
        return response()->json([
            'data' => [
                ['value' => 'pet_sitting', 'label' => 'Gardien/Gardienne d animaux'],
                ['value' => 'training', 'label' => 'Dresseur/Dresseuse d animaux'],
            ],
        ]);
    }

    public function feed(Request $request)
    {
        $pagination = PaginationData::fromRequest($request, 4, 12);

        return ServiceListingResource::collection(
            ServiceListing::query()
                ->with('user:id,name,email,phone,avatar,city,country')
                ->where('status', 'active')
                ->when($request->user(), fn ($query, $user) => $query->where('user_id', '!=', $user->id))
                ->orderByDesc('reservations_count')
                ->latest()
                ->paginate($pagination->perPage),
        );
    }

    public function store(StoreServiceListingRequest $request): JsonResponse
    {
        $this->authorize('create', ServiceListing::class);

        $service = ServiceListing::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'status' => 'active',
        ]);

        $this->activityLogger->log(
            'service.created',
            'service',
            $service,
            ['type' => $service->type, 'title' => $service->title],
            $request->user(),
            $request->user(),
            $request,
        );

        return ServiceListingResource::make($service->load('user'))
            ->response()
            ->setStatusCode(201);
    }

    public function show(ServiceListing $service): ServiceListingResource
    {
        abort_if($service->status !== 'active' && ! request()->user()?->is($service->user), 404);

        $service->increment('views_count');

        return ServiceListingResource::make($service->load('user'));
    }

    public function update(UpdateServiceListingRequest $request, ServiceListing $service): ServiceListingResource
    {
        $this->authorize('update', $service);

        $service->update($request->validated());

        $this->activityLogger->log(
            'service.updated',
            'service',
            $service,
            ['type' => $service->type, 'title' => $service->title],
            $request->user(),
            $request->user(),
            $request,
        );

        return ServiceListingResource::make($service->load('user'));
    }

    public function destroy(Request $request, ServiceListing $service): JsonResponse
    {
        $this->authorize('delete', $service);

        $this->activityLogger->log(
            'service.deleted',
            'service',
            $service,
            ['type' => $service->type, 'title' => $service->title],
            $request->user(),
            $request->user(),
            $request,
        );

        $service->delete();

        return response()->json([
            'message' => 'Service supprime avec succes.',
        ]);
    }
}
