<?php

namespace App\DTOs\Payments;

class PaymentCallbackResult
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public readonly string $provider,
        public readonly bool $success,
        public readonly string $status,
        public readonly ?string $internalReference = null,
        public readonly ?string $providerReference = null,
        public readonly ?string $message = null,
        public readonly array $payload = [],
        public readonly ?bool $signatureValid = null,
    ) {}
}
