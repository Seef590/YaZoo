<?php

namespace App\Http\Requests\ProfessionalVerification;

use App\Models\ProfessionalVerification;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProfessionalVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'business_type' => ['required', 'string', Rule::in(ProfessionalVerification::BUSINESS_TYPES)],
            'legal_name' => ['nullable', 'string', 'max:190'],
            'ice' => ['nullable', 'string', 'max:50'],
            'onssa_authorization_number' => ['nullable', 'string', 'max:100'],
            'professional_license_number' => ['nullable', 'string', 'max:100'],
            'document_path' => ['nullable', 'string', 'max:2048'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(collect([
            'business_type',
            'legal_name',
            'ice',
            'onssa_authorization_number',
            'professional_license_number',
            'document_path',
        ])->mapWithKeys(fn (string $field): array => [
            $field => is_string($this->input($field)) ? trim($this->input($field)) : $this->input($field),
        ])->all());
    }
}
