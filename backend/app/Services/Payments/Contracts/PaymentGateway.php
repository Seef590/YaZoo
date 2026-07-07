<?php

namespace App\Services\Payments\Contracts;

use App\DTOs\Payments\PaymentCallbackResult;
use App\DTOs\Payments\PaymentInitiationResult;
use App\DTOs\Payments\PaymentResult;
use App\Models\Payment;

interface PaymentGateway
{
    public function supports(string $provider): bool;

    public function initiate(Payment $payment): PaymentInitiationResult;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function handleCallback(array $payload): PaymentCallbackResult;

    public function refund(Payment $payment, ?float $amount = null): PaymentResult;
}
