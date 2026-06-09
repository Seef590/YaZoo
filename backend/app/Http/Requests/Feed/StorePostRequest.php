<?php

namespace App\Http\Requests\Feed;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => ['nullable', 'string', 'max:5000'],
            'location' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array', 'max:10'],
            'tags.*' => ['string', 'max:50'],
            'media_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,gif,mp4,webm,mov', 'max:51200'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $tags = collect($this->input('tags', []))
            ->filter(fn ($tag) => is_string($tag) && trim($tag) !== '')
            ->map(fn ($tag) => trim($tag))
            ->values()
            ->all();

        $this->merge([
            'content' => trim((string) $this->input('content')),
            'location' => trim((string) $this->input('location')),
            'tags' => $tags,
        ]);
    }

    /**
     * Configure post-specific validation after basic rules.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $hasContent = trim((string) $this->input('content')) !== '';
            $hasMedia = $this->hasFile('media_file');

            if (! $hasContent && ! $hasMedia) {
                $validator->errors()->add(
                    'content',
                    'Le post doit contenir du texte ou un media image/video.',
                );
            }
        });
    }
}
