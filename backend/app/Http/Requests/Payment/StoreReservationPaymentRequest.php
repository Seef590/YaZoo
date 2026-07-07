<?php

namespace App\Http\Requests\Payment;

use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReservationPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'provider' => ['nullable', Rule::in(Payment::PROVIDERS)],
            'idempotency_key' => ['nullable', 'string', 'max:120'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $provider = $this->input('provider') ?: config('payments.default_provider', Payment::PROVIDER_MANUAL_BANK_TRANSFER);

        $this->merge([
            'provider' => Payment::normalizeProvider(trim((string) $provider)),
            'idempotency_key' => trim((string) ($this->input('idempotency_key') ?: $this->header('Idempotency-Key'))),
        ]);
    }
}
