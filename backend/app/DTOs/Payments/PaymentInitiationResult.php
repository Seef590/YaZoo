<?php

namespace App\DTOs\Payments;

class PaymentInitiationResult
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public readonly string $provider,
        public readonly string $status,
        public readonly ?string $checkoutUrl = null,
        public readonly ?string $message = null,
        public readonly array $payload = [],
        public readonly bool $requiresRedirect = false,
    ) {}
}
