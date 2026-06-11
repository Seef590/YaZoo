<?php

namespace App\Http\Requests\Messaging;

use App\Models\User;
use App\Support\PhoneNumber;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

class StoreConversationRequest extends FormRequest
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
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'recipient_id' => [
                'nullable',
                'required_without:recipient_contact',
                'integer',
                'exists:users,id',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if ((int) $value === (int) $this->user()?->id) {
                        $fail('Vous ne pouvez pas vous envoyer un message.');
                    }
                },
            ],
            'recipient_contact' => [
                'nullable',
                'required_without:recipient_id',
                'string',
                'max:255',
                function (string $attribute, mixed $value, Closure $fail): void {
                    $contact = trim((string) $value);
                    $phone = PhoneNumber::normalize($contact);

                    $recipient = User::query()
                        ->where('email', $contact)
                        ->orWhere('phone', $phone)
                        ->first();

                    if (! $recipient) {
                        $fail('Aucun utilisateur ne correspond a ce contact.');

                        return;
                    }

                    if ($recipient->is($this->user())) {
                        $fail('Vous ne pouvez pas vous envoyer un message.');
                    }
                },
            ],
            'body' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $contact = $this->input('recipient_contact')
            ?? $this->input('recipient_phone')
            ?? $this->input('recipient_email');

        $this->merge([
            'recipient_id' => $this->input('recipient_id'),
            'recipient_contact' => is_string($contact) ? trim($contact) : $contact,
        ]);
    }
}
