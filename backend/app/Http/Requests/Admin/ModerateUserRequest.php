<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ModerateUserRequest extends FormRequest
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
            'action' => ['required', 'string', Rule::in(['suspend', 'unsuspend', 'ban', 'unban'])],
            'reason' => ['nullable', 'string', 'max:2000', 'required_if:action,suspend,ban'],
        ];
    }
}
