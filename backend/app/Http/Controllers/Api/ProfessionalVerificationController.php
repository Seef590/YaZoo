<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfessionalVerification\StoreProfessionalVerificationRequest;
use App\Http\Requests\ProfessionalVerification\UpdateProfessionalVerificationStatusRequest;
use App\Http\Resources\ProfessionalVerificationResource;
use App\Models\ProfessionalVerification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProfessionalVerificationController extends Controller
{
    public function store(StoreProfessionalVerificationRequest $request): JsonResponse
    {
        $verification = ProfessionalVerification::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'status' => 'pending',
        ])->load(['user:id,name,email,phone,city,country', 'verifier:id,name']);

        return response()->json([
            'message' => __('messages.professional_verifications.submitted'),
            'verification' => ProfessionalVerificationResource::make($verification),
        ], 201);
    }

    public function me(Request $request): AnonymousResourceCollection
    {
        $verifications = ProfessionalVerification::query()
            ->where('user_id', $request->user()->id)
            ->with('verifier:id,name')
            ->latest()
            ->get();

        return ProfessionalVerificationResource::collection($verifications);
    }

    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        abort_unless((bool) $request->user()?->is_admin, 403);

        $verifications = ProfessionalVerification::query()
            ->with(['user:id,name,email,phone,city,country', 'verifier:id,name'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->trim()))
            ->latest()
            ->limit((int) min(max($request->integer('limit', 50), 1), 100))
            ->get();

        return ProfessionalVerificationResource::collection($verifications);
    }

    public function updateStatus(
        UpdateProfessionalVerificationStatusRequest $request,
        ProfessionalVerification $professionalVerification,
    ): JsonResponse {
        $status = $request->validated('status');

        $professionalVerification->update([
            'status' => $status,
            'admin_note' => $request->validated('admin_note') ?? $professionalVerification->admin_note,
            'verified_by' => $request->user()->id,
            'verified_at' => $status === 'pending' ? null : now(),
        ]);

        return response()->json([
            'message' => __('messages.professional_verifications.status_updated'),
            'verification' => ProfessionalVerificationResource::make(
                $professionalVerification->load(['user:id,name,email,phone,city,country', 'verifier:id,name']),
            ),
        ]);
    }
}
