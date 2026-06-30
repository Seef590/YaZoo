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
        return [
            'id' => $this->id,
            'businessType' => $this->business_type,
            'legalName' => $this->legal_name,
            'ice' => $this->ice,
            'onssaAuthorizationNumber' => $this->onssa_authorization_number,
            'professionalLicenseNumber' => $this->professional_license_number,
            'documentPath' => $this->document_path,
            'status' => $this->status,
            'adminNote' => $this->admin_note,
            'verifiedAt' => $this->verified_at?->toISOString(),
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
        ];
    }
}
