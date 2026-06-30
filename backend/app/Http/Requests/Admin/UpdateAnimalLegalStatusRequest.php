<?php

namespace App\Http\Requests\Admin;

use App\Models\Animal;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAnimalLegalStatusRequest extends FormRequest
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
            'legal_status' => ['required', 'string', Rule::in(Animal::LEGAL_STATUSES)],
            'moderation_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
