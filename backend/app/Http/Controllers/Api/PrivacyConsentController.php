<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Privacy\StorePrivacyConsentRequest;
use App\Http\Resources\PrivacyConsentResource;
use App\Models\PrivacyConsent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PrivacyConsentController extends Controller
{
    public function storePublic(StorePrivacyConsentRequest $request): JsonResponse
    {
        return $this->storeConsent($request, null);
    }

    public function store(StorePrivacyConsentRequest $request): JsonResponse
    {
        return $this->storeConsent($request, $request->user()?->id);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $consents = PrivacyConsent::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return PrivacyConsentResource::collection($consents);
    }

    private function storeConsent(StorePrivacyConsentRequest $request, ?int $userId): JsonResponse
    {
        $validated = $request->validated();
        $accepted = (bool) $validated['accepted'];

        $consent = PrivacyConsent::query()->create([
            'user_id' => $userId,
            'type' => $validated['type'],
            'accepted' => $accepted,
            'locale' => $validated['locale'] ?? 'fr',
            'ip_hash' => $this->hashValue($request->ip()),
            'user_agent_hash' => $this->hashValue($request->userAgent()),
            'accepted_at' => $accepted ? now() : null,
        ]);

        return response()->json([
            'message' => __('messages.privacy.consent_saved'),
            'consent' => PrivacyConsentResource::make($consent),
        ], 201);
    }

    private function hashValue(?string $value): ?string
    {
        $safeValue = trim((string) $value);

        if ($safeValue === '') {
            return null;
        }

        return hash('sha256', $safeValue.'|'.config('app.key'));
    }
}
