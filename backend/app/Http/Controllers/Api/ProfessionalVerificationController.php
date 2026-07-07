<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfessionalVerification\StoreProfessionalVerificationRequest;
use App\Http\Requests\ProfessionalVerification\UpdateProfessionalVerificationStatusRequest;
use App\Http\Resources\ProfessionalVerificationResource;
use App\Models\ProfessionalVerification;
use App\Services\Admin\ModerationLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProfessionalVerificationController extends Controller
{
    public function __construct(
        private readonly ModerationLogger $logger,
    ) {}

    public function store(StoreProfessionalVerificationRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $document = $request->file('document');
        unset($validated['document']);

        if ($document) {
            $path = $document->storeAs(
                'professional-verifications/'.$request->user()->id,
                Str::uuid()->toString().'.'.strtolower($document->getClientOriginalExtension()),
                'local',
            );

            $validated = [
                ...$validated,
                'document_path' => $path,
                'document_original_name' => $document->getClientOriginalName(),
                'document_mime' => $document->getMimeType(),
                'document_size' => $document->getSize(),
            ];
        }

        $verification = ProfessionalVerification::query()->create([
            ...$validated,
            'user_id' => $request->user()->id,
            'status' => 'pending',
        ])->load(['user:id,name,email,phone,city,country', 'verifier:id,name', 'reviewer:id,name']);

        return response()->json([
            'message' => __('messages.professional_verifications.submitted'),
            'verification' => ProfessionalVerificationResource::make($verification),
        ], 201);
    }

    public function me(Request $request): AnonymousResourceCollection
    {
        $verifications = ProfessionalVerification::query()
            ->where('user_id', $request->user()->id)
            ->with(['verifier:id,name', 'reviewer:id,name'])
            ->latest()
            ->get();

        return ProfessionalVerificationResource::collection($verifications);
    }

    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        abort_unless((bool) $request->user()?->is_admin, 403);

        $verifications = ProfessionalVerification::query()
            ->with(['user:id,name,email,phone,city,country', 'verifier:id,name', 'reviewer:id,name'])
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
            'review_reason' => $request->validated('review_reason') ?? $professionalVerification->review_reason,
            'admin_note' => $request->validated('admin_note') ?? $professionalVerification->admin_note,
            'reviewed_by' => $status === 'pending' ? null : $request->user()->id,
            'reviewed_at' => $status === 'pending' ? null : now(),
            'verified_by' => $request->user()->id,
            'verified_at' => $status === 'pending' ? null : now(),
        ]);

        $this->logger->log($request, 'update_professional_verification', $professionalVerification, $request->validated('admin_note'), [
            'status' => $status,
            'review_reason' => $request->validated('review_reason'),
        ]);

        return response()->json([
            'message' => __('messages.professional_verifications.status_updated'),
            'verification' => ProfessionalVerificationResource::make(
                $professionalVerification->load(['user:id,name,email,phone,city,country', 'verifier:id,name', 'reviewer:id,name']),
            ),
        ]);
    }

    public function downloadDocument(Request $request, ProfessionalVerification $professionalVerification): StreamedResponse
    {
        abort_unless((bool) $request->user()?->is_admin, 403);
        abort_unless(filled($professionalVerification->document_path), 404);
        abort_unless(Storage::disk('local')->exists($professionalVerification->document_path), 404);

        return Storage::disk('local')->download(
            $professionalVerification->document_path,
            $this->safeDownloadName($professionalVerification),
        );
    }

    protected function safeDownloadName(ProfessionalVerification $professionalVerification): string
    {
        $originalName = basename((string) $professionalVerification->document_original_name);
        $safeName = preg_replace('/[^A-Za-z0-9._-]+/', '_', $originalName) ?: '';
        $safeName = trim($safeName, '._-');

        if ($safeName !== '') {
            return $safeName;
        }

        $extension = match ($professionalVerification->document_mime) {
            'application/pdf' => 'pdf',
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => 'bin',
        };

        return 'verification-document.'.$extension;
    }
}
