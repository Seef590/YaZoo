<?php

namespace App\Http\Controllers\Api;

use App\DTOs\PaginationData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Marketplace\StoreVeterinarianRequest;
use App\Http\Requests\Marketplace\UpdateVeterinarianRequest;
use App\Http\Resources\Marketplace\VeterinarianResource;
use App\Models\Veterinarian;
use App\Support\MarketplaceMedia;
use App\Support\MediaStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VeterinarianController extends Controller
{
    public function index(Request $request)
    {
        $pagination = PaginationData::fromRequest($request, 12, 50);

        $query = Veterinarian::query()
            ->with('user:id,name')
            ->latest();

        if (! $request->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        if ($request->filled('city')) {
            $query->where('city', 'like', '%'.$request->string('city').'%');
        }

        if ($request->filled('specialty')) {
            $query->where('specialties', 'like', '%'.$request->string('specialty').'%');
        }

        if ($request->filled('search')) {
            $search = '%'.$request->string('search').'%';
            $query->where(function ($inner) use ($search): void {
                $inner
                    ->where('name', 'like', $search)
                    ->orWhere('clinic_name', 'like', $search)
                    ->orWhere('description', 'like', $search)
                    ->orWhere('city', 'like', $search)
                    ->orWhere('address', 'like', $search);
            });
        }

        return VeterinarianResource::collection($query->paginate($pagination->perPage));
    }

    public function store(StoreVeterinarianRequest $request): JsonResponse
    {
        $this->authorize('create', Veterinarian::class);

        $validated = $this->prepareMedia($request, $request->validated());

        $veterinarian = Veterinarian::query()->create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return VeterinarianResource::make($veterinarian->load('user'))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Veterinarian $veterinarian): VeterinarianResource
    {
        abort_if(! $veterinarian->is_active && ! request()->user()?->is($veterinarian->user), 404);

        return VeterinarianResource::make($veterinarian->load('user'));
    }

    public function update(UpdateVeterinarianRequest $request, Veterinarian $veterinarian): VeterinarianResource
    {
        $this->authorize('update', $veterinarian);

        $validated = $this->prepareMedia($request, $request->validated(), $veterinarian);

        $veterinarian->update($validated);

        return VeterinarianResource::make($veterinarian->load('user'));
    }

    public function destroy(Request $request, Veterinarian $veterinarian): JsonResponse
    {
        $this->authorize('delete', $veterinarian);

        $veterinarian->delete();

        return response()->json([
            'message' => __('messages.marketplace.veterinarian_deleted'),
        ]);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    protected function prepareMedia(Request $request, array $validated, ?Veterinarian $veterinarian = null): array
    {
        if ($request->hasFile('image')) {
            $uploaded = MediaStorage::storeUploadedFile($request->file('image'), 'marketplace/veterinarians');

            if ($veterinarian?->image_path) {
                MarketplaceMedia::deleteStoredFiles([$veterinarian->image_path]);
            }

            $validated['image_path'] = $uploaded;
        }

        return $validated;
    }
}
