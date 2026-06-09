<?php

namespace App\Http\Requests\Reservation;

use App\Models\Reservation;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReservationRequest extends FormRequest
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
            'quantity' => ['nullable', 'integer', 'min:1', 'max:99'],
            'note' => ['nullable', 'string', 'max:1500'],
            'payment_method' => ['required', Rule::in(Reservation::PAYMENT_METHODS)],
            'delivery_method' => ['required', Rule::in(Reservation::DELIVERY_METHODS)],
            'delivery_contact_name' => ['nullable', 'string', 'max:255'],
            'delivery_phone' => ['nullable', 'string', 'max:50'],
            'delivery_city' => ['required_if:delivery_method,delivery', 'nullable', 'string', 'max:255'],
            'delivery_address' => ['required_if:delivery_method,delivery', 'nullable', 'string', 'max:1000'],
            'delivery_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'note' => trim((string) $this->input('note')),
            'payment_method' => trim((string) $this->input('payment_method')),
            'delivery_method' => trim((string) $this->input('delivery_method')),
            'delivery_contact_name' => trim((string) $this->input('delivery_contact_name')),
            'delivery_phone' => trim((string) $this->input('delivery_phone')),
            'delivery_city' => trim((string) $this->input('delivery_city')),
            'delivery_address' => trim((string) $this->input('delivery_address')),
            'delivery_notes' => trim((string) $this->input('delivery_notes')),
        ]);
    }
}
