<?php

namespace App\Services\Payments;

use App\DTOs\Payments\PaymentCallbackResult;
use App\DTOs\Payments\PaymentInitiationResult;
use App\DTOs\Payments\PaymentResult;
use App\Models\Payment;
use App\Services\Payments\Contracts\PaymentGateway;

class CashOnPickupGateway implements PaymentGateway
{
    public function supports(string $provider): bool
    {
        return $provider === Payment::PROVIDER_CASH_ON_PICKUP;
    }

    public function initiate(Payment $payment): PaymentInitiationResult
    {
        return new PaymentInitiationResult(
            provider: Payment::PROVIDER_CASH_ON_PICKUP,
            status: Payment::STATUS_PENDING,
            message: 'Paiement a la remise en attente de finalisation manuelle.',
            payload: [
                'manual' => true,
                'marksPaidAutomatically' => false,
            ],
        );
    }

    public function handleCallback(array $payload): PaymentCallbackResult
    {
        return new PaymentCallbackResult(
            provider: Payment::PROVIDER_CASH_ON_PICKUP,
            success: false,
            status: 'rejected',
            message: 'Le paiement a la remise ne supporte pas de callback automatique.',
            payload: $payload,
            signatureValid: null,
        );
    }

    public function refund(Payment $payment, ?float $amount = null): PaymentResult
    {
        return new PaymentResult(
            provider: Payment::PROVIDER_CASH_ON_PICKUP,
            success: false,
            status: Payment::STATUS_PENDING,
            message: 'Remboursement manuel requis hors passerelle.',
        );
    }
}
