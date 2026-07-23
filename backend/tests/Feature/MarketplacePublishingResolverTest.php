<?php

namespace Tests\Feature;

use App\Models\ProfessionalVerification;
use App\Models\User;
use App\Services\MarketplacePublishingResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class MarketplacePublishingResolverTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, array{string, string, string|null}>
     */
    public static function approvedBusinessTypes(): array
    {
        return [
            'seller publishes products' => ['seller', 'products', null],
            'pet shop publishes products' => ['pet_shop', 'products', null],
            'breeder publishes animals' => ['breeder', 'animals', null],
            'veterinarian publishes veterinarian profile' => ['veterinarian', 'veterinarians', null],
            'trainer publishes training service' => ['trainer', 'services', 'training'],
            'service provider publishes service' => ['service_provider', 'services', null],
        ];
    }

    #[DataProvider('approvedBusinessTypes')]
    public function test_it_resolves_approved_professional_destinations(
        string $businessType,
        string $destination,
        ?string $serviceType,
    ): void {
        $user = User::factory()->create();
        ProfessionalVerification::query()->create([
            'user_id' => $user->id,
            'business_type' => $businessType,
            'status' => 'approved',
            'document_path' => 'professional-verifications/private.pdf',
        ]);

        $capability = app(MarketplacePublishingResolver::class)->resolve($user);

        $this->assertSame([
            'canPublish' => true,
            'businessType' => $businessType,
            'verificationStatus' => 'approved',
            'destination' => $destination,
            'serviceType' => $serviceType,
        ], $capability);
        $this->assertArrayNotHasKey('document_path', $capability);
        $this->assertArrayNotHasKey('documentPath', $capability);
    }

    #[DataProvider('nonPublishingStatuses')]
    public function test_it_rejects_non_approved_or_expired_verifications(
        string $status,
        ?string $expiresAt,
    ): void {
        $user = User::factory()->create();
        ProfessionalVerification::query()->create([
            'user_id' => $user->id,
            'business_type' => 'seller',
            'status' => $status,
            'document_expires_at' => $expiresAt,
        ]);

        $this->assertSame(
            $this->emptyCapability(),
            app(MarketplacePublishingResolver::class)->resolve($user),
        );
    }

    /**
     * @return array<string, array{string, string|null}>
     */
    public static function nonPublishingStatuses(): array
    {
        return [
            'pending' => ['pending', null],
            'rejected' => ['rejected', null],
            'expired approved document' => ['approved', '2020-01-01'],
        ];
    }

    public function test_it_rejects_a_user_without_verification(): void
    {
        $user = User::factory()->create();

        $this->assertSame(
            $this->emptyCapability(),
            app(MarketplacePublishingResolver::class)->resolve($user),
        );
    }

    public function test_it_does_not_guess_a_destination_for_an_unsupported_approved_type(): void
    {
        $user = User::factory()->create();
        ProfessionalVerification::query()->create([
            'user_id' => $user->id,
            'business_type' => 'association',
            'status' => 'approved',
        ]);

        $this->assertSame([
            'canPublish' => false,
            'businessType' => 'association',
            'verificationStatus' => 'approved',
            'destination' => null,
            'serviceType' => null,
        ], app(MarketplacePublishingResolver::class)->resolve($user));
    }

    /**
     * @return array{canPublish: false, businessType: null, verificationStatus: null, destination: null, serviceType: null}
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
