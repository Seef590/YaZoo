<?php

namespace App\Services\Payments;

use App\DTOs\Payments\PaymentCallbackResult;
use App\DTOs\Payments\PaymentInitiationResult;
use App\DTOs\Payments\PaymentResult;
use App\Models\Payment;
use App\Services\Payments\Contracts\PaymentGateway;

class ManualBankTransferGateway implements PaymentGateway
{
    public function supports(string $provider): bool
    {
        return in_array($provider, [Payment::PROVIDER_MANUAL_BANK_TRANSFER, 'bank_transfer'], true);
    }

    public function initiate(Payment $payment): PaymentInitiationResult
    {
        return new PaymentInitiationResult(
            provider: Payment::PROVIDER_MANUAL_BANK_TRANSFER,
            status: Payment::STATUS_PENDING,
            message: 'Virement bancaire en attente de verification manuelle.',
            payload: [
                'manual' => true,
                'marksPaidAutomatically' => false,
            ],
        );
    }

    public function handleCallback(array $payload): PaymentCallbackResult
    {
        return new PaymentCallbackResult(
            provider: Payment::PROVIDER_MANUAL_BANK_TRANSFER,
            success: false,
            status: 'rejected',
            message: 'Le virement bancaire ne supporte pas de callback automatique.',
            payload: $payload,
            signatureValid: null,
        );
    }

    public function refund(Payment $payment, ?float $amount = null): PaymentResult
    {
        return new PaymentResult(
            provider: Payment::PROVIDER_MANUAL_BANK_TRANSFER,
            success: false,
            status: Payment::STATUS_PENDING,
            message: 'Remboursement manuel requis hors passerelle.',
        );
    }
}
