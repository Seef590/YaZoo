<?php

namespace App\Http\Resources;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Payment
 */
class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reservationId' => $this->reservation_id,
            'provider' => $this->provider,
            'status' => $this->status,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'commissionAmount' => (float) $this->commission_amount,
            'netAmount' => $this->net_amount !== null ? (float) $this->net_amount : null,
            'providerReference' => $this->provider_reference,
            'internalReference' => $this->internal_reference,
            'checkoutUrl' => $this->checkout_url,
            'paidAt' => $this->paid_at?->toISOString(),
            'failedAt' => $this->failed_at?->toISOString(),
            'refundedAt' => $this->refunded_at?->toISOString(),
            'cancelledAt' => $this->cancelled_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
