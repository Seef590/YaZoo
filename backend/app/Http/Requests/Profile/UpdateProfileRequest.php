<?php

namespace App\Http\Requests\Profile;

use App\Models\User;
use App\Support\PhoneNumber;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var User|null $routeUser */
        $routeUser = $this->route('user');

        return $this->user()?->is($routeUser) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $routeUser = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:120'],
            'phone' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('users', 'phone')->ignore($routeUser?->id),
            ],
            'country' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'preferred_locale' => ['nullable', 'string', 'in:fr,ar'],
            'avatar' => ['nullable', 'string', 'max:2048'],
            'cover_photo' => ['nullable', 'string', 'max:2048'],
            'avatar_file' => ['nullable', 'file', 'image', 'max:10240'],
            'cover_photo_file' => ['nullable', 'file', 'image', 'max:12288'],
            'remove_avatar' => ['nullable', 'boolean'],
            'remove_cover_photo' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $fields = [
            'name',
            'phone',
            'country',
            'city',
            'bio',
            'preferred_locale',
            'avatar',
            'cover_photo',
        ];

        $normalized = [];

        foreach ($fields as $field) {
            if (! $this->exists($field)) {
                continue;
            }

            $value = $this->input($field);
            $normalized[$field] = is_string($value) ? trim($value) : $value;
        }

        if (array_key_exists('phone', $normalized)) {
            $normalized['phone'] = PhoneNumber::normalize($normalized['phone']);
        }

        $this->merge($normalized);
    }
}
