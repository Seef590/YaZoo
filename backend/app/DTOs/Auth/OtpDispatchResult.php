<?php

namespace App\DTOs\Auth;

final readonly class OtpDispatchResult
{
    public function __construct(
        public string $message,
        public string $expiresAt,
    ) {}
}
