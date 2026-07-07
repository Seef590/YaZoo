<?php

namespace App\Http\Resources;

use App\Models\ProfessionalVerification;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ProfessionalVerification
 */
class ProfessionalVerificationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $viewer = $request->user();
        $isAdmin = (bool) ($viewer?->is_admin ?? false);
        $isOwner = (int) ($viewer?->id ?? 0) === (int) $this->user_id;
        $hasDocument = filled($this->document_path);

        return [
            'id' => $this->id,
            'businessType' => $this->business_type,
            'legalName' => $this->legal_name,
            'ice' => $this->ice,
            'onssaAuthorizationNumber' => $this->onssa_authorization_number,
            'professionalLicenseNumber' => $this->professional_license_number,
            'documentPath' => null,
            'hasDocument' => $hasDocument,
            'documentType' => $this->document_type,
            'documentOriginalName' => ($isAdmin || $isOwner) ? $this->document_original_name : null,
            'documentMime' => $isAdmin ? $this->document_mime : null,
            'documentSize' => ($isAdmin || $isOwner) ? $this->document_size : null,
            'documentExpiresAt' => $this->document_expires_at?->toDateString(),
            'documentDownloadUrl' => $this->when(
                $isAdmin && $hasDocument,
                fn (): string => "/api/admin/professional-verifications/{$this->id}/document",
            ),
            'status' => $this->effectiveStatus(),
            'storedStatus' => $this->status,
            'reviewReason' => ($isAdmin || $isOwner) ? $this->review_reason : null,
            'adminNote' => $isAdmin ? $this->admin_note : null,
            'verifiedAt' => $this->verified_at?->toISOString(),
            'reviewedAt' => $this->reviewed_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'user' => $this->whenLoaded('user', fn (): array => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $this->user?->publicEmail(),
                'phone' => $this->user?->phone,
                'city' => $this->user?->city,
                'country' => $this->user?->country,
            ]),
            'verifier' => $this->whenLoaded('verifier', fn (): array => [
                'id' => $this->verifier?->id,
                'name' => $this->verifier?->name,
            ]),
            'reviewer' => $this->whenLoaded('reviewer', fn (): array => [
                'id' => $this->reviewer?->id,
                'name' => $this->reviewer?->name,
            ]),
        ];
    }
}
