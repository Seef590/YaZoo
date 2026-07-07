<?php

namespace App\DTOs\Payments;

class PaymentResult
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public readonly string $provider,
        public readonly bool $success,
        public readonly string $status,
        public readonly ?string $message = null,
        public readonly array $payload = [],
    ) {}
}
