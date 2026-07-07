<?php

namespace App\Http\Requests\ProfessionalVerification;

use App\Models\ProfessionalVerification;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfessionalVerificationStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(ProfessionalVerification::STATUSES)],
            'review_reason' => ['nullable', 'string', 'max:2000', 'required_if:status,rejected'],
            'admin_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
