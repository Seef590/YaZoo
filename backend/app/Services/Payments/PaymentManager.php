<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Services\Payments\Contracts\PaymentGateway;
use InvalidArgumentException;

class PaymentManager
{
    /**
     * @param  iterable<int, PaymentGateway>|null  $gateways
     */
    public function __construct(
        protected ?iterable $gateways = null,
    ) {}

    public function gateway(string $provider): PaymentGateway
    {
        $normalizedProvider = Payment::normalizeProvider($provider);

        foreach ($this->gateways() as $gateway) {
            if ($gateway->supports($normalizedProvider)) {
                return $gateway;
            }
        }

        throw new InvalidArgumentException("Provider paiement non supporte: {$provider}");
    }

    /**
     * @return array<int, PaymentGateway>
     */
    protected function gateways(): array
    {
        if ($this->gateways !== null) {
            return is_array($this->gateways) ? $this->gateways : iterator_to_array($this->gateways);
        }

        return [
            app(CashOnPickupGateway::class),
            app(ManualBankTransferGateway::class),
            app(CmiGateway::class),
        ];
    }
}
