<?php

namespace App\Services;

use App\Models\ProfessionalVerification;
use App\Models\User;

class MarketplacePublishingResolver
{
    /**
     * @var array<string, array{destination: string, serviceType: string|null}>
     */
    private const DESTINATIONS = [
        'seller' => ['destination' => 'products', 'serviceType' => null],
        'pet_shop' => ['destination' => 'products', 'serviceType' => null],
        'breeder' => ['destination' => 'animals', 'serviceType' => null],
        'veterinarian' => ['destination' => 'veterinarians', 'serviceType' => null],
        'trainer' => ['destination' => 'services', 'serviceType' => 'training'],
        'service_provider' => ['destination' => 'services', 'serviceType' => null],
    ];

    /**
     * @return array{
     *     canPublish: bool,
     *     businessType: string|null,
     *     verificationStatus: string|null,
     *     destination: string|null,
     *     serviceType: string|null
     * }
     */
    public function resolve(User $user): array
    {
        $user->loadMissing('latestProfessionalVerification');
        $verification = $user->latestProfessionalVerification;

        if (! $verification) {
            return $this->emptyCapability();
        }

        $businessType = in_array(
            $verification->business_type,
            ProfessionalVerification::BUSINESS_TYPES,
            true,
        ) ? $verification->business_type : null;
        $verificationStatus = $verification->effectiveStatus();

        if ($businessType === null || $verificationStatus !== 'approved') {
            return $this->emptyCapability();
        }

        $target = self::DESTINATIONS[$businessType] ?? null;

        return [
            'canPublish' => $target !== null,
            'businessType' => $businessType,
            'verificationStatus' => 'approved',
            'destination' => $target['destination'] ?? null,
            'serviceType' => $target['serviceType'] ?? null,
        ];
    }

    /**
     * @return array{
     *     canPublish: false,
     *     businessType: null,
     *     verificationStatus: null,
     *     destination: null,
     *     serviceType: null
     * }
     */
    private function emptyCapability(): array
    {
        return [
            'canPublish' => false,
            'businessType' => null,
            'verificationStatus' => null,
            'destination' => null,
            'serviceType' => null,
        ];
    }
}
