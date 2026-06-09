<?php

namespace App\Services;

use App\Models\Animal;
use App\Models\Product;
use App\Models\Reservation;
use App\Models\User;
use App\Notifications\ReservationApprovedNotification;
use App\Notifications\ReservationCancelledNotification;
use App\Notifications\ReservationCompletedNotification;
use App\Notifications\ReservationDeliveryUpdatedNotification;
use App\Notifications\ReservationRejectedNotification;
use App\Notifications\ReservationRequestedNotification;
use App\Repositories\ReservationRepository;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class ReservationService
{
    public function __construct(
        protected ReservationRepository $reservations,
    ) {}

    /**
     * @return array{buyer: mixed, seller: mixed}
     */
    public function listForUser(User $user, int $perPage): array
    {
        return [
            'buyer' => $this->reservations->buyerReservations($user, $perPage),
            'seller' => $this->reservations->sellerReservations($user, $perPage),
        ];
    }

    /**
     * @return array{buyer: mixed, seller: mixed}
     */
    public function historyForUser(User $user, int $perPage): array
    {
        return [
            'buyer' => $this->reservations->buyerHistory($user, $perPage),
            'seller' => $this->reservations->sellerHistory($user, $perPage),
        ];
    }

    public function loadInvoice(Reservation $reservation): Reservation
    {
        return $reservation->load([
            'buyer:id,name,email,phone,city,country',
            'seller:id,name,email,phone,city,country',
            'reservable.user:id,name,email,phone,avatar,city,country',
            'reviews.reviewer:id,name,avatar',
            'reviews.reviewee:id,name,avatar',
        ]);
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    public function createAnimal(User $buyer, Animal $animal, array $validated): Reservation
    {
        $reservation = DB::transaction(function () use ($buyer, $animal, $validated): Reservation {
            $lockedAnimal = Animal::query()
                ->lockForUpdate()
                ->findOrFail($animal->id);

            abort_if($lockedAnimal->listing_status !== 'available', 422, "Cette annonce animal n'est plus reservable.");
            abort_if(
                $lockedAnimal->reservations()->whereIn('reservation_status', $this->activeStatuses())->exists(),
                422,
                'Une reservation active existe deja pour cette annonce animal.',
            );

            $reservation = Reservation::create([
                'buyer_id' => $buyer->id,
                'seller_id' => $lockedAnimal->user_id,
                'reservable_type' => Animal::class,
                'reservable_id' => $lockedAnimal->id,
                'quantity' => 1,
                'delivery_method' => $validated['delivery_method'],
                'note' => $validated['note'] ?? null,
                'payment_method' => $validated['payment_method'],
                'reservation_status' => 'pending',
                'payment_status' => 'pending',
                'delivery_status' => 'pending',
                'delivery_contact_name' => $validated['delivery_contact_name'] ?? null,
                'delivery_phone' => $validated['delivery_phone'] ?? null,
                'delivery_city' => $validated['delivery_city'] ?? null,
                'delivery_address' => $validated['delivery_address'] ?? null,
                'delivery_notes' => $validated['delivery_notes'] ?? null,
                'unit_price' => $lockedAnimal->price ?? 0,
                'total_price' => $lockedAnimal->price ?? 0,
                'delivery_fee' => $this->computeDeliveryFee(Animal::class, $validated['delivery_method'], 1),
            ]);

            $lockedAnimal->update([
                'listing_status' => 'reserved',
            ]);

            return $reservation;
        });

        $reservation = $this->reservations->loadForResponse($reservation);
        $reservation->seller?->notify(new ReservationRequestedNotification($reservation));

        return $reservation;
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    public function createProduct(User $buyer, Product $product, array $validated): Reservation
    {
        $reservation = DB::transaction(function () use ($buyer, $product, $validated): Reservation {
            $lockedProduct = Product::query()
                ->lockForUpdate()
                ->findOrFail($product->id);

            abort_if($lockedProduct->listing_status === 'sold' || $lockedProduct->stock <= 0, 422, "Ce produit n'est plus reservable.");

            $quantity = (int) ($validated['quantity'] ?? 1);
            $availableQuantity = $this->availableProductQuantity($lockedProduct);

            abort_if($quantity > $availableQuantity, 422, 'La quantite demandee depasse le stock reservable disponible.');

            $reservation = Reservation::create([
                'buyer_id' => $buyer->id,
                'seller_id' => $lockedProduct->user_id,
                'reservable_type' => Product::class,
                'reservable_id' => $lockedProduct->id,
                'quantity' => $quantity,
                'delivery_method' => $validated['delivery_method'],
                'note' => $validated['note'] ?? null,
                'payment_method' => $validated['payment_method'],
                'reservation_status' => 'pending',
                'payment_status' => 'pending',
                'delivery_status' => 'pending',
                'delivery_contact_name' => $validated['delivery_contact_name'] ?? null,
                'delivery_phone' => $validated['delivery_phone'] ?? null,
                'delivery_city' => $validated['delivery_city'] ?? null,
                'delivery_address' => $validated['delivery_address'] ?? null,
                'delivery_notes' => $validated['delivery_notes'] ?? null,
                'unit_price' => $lockedProduct->price,
                'total_price' => (float) $lockedProduct->price * $quantity,
                'delivery_fee' => $this->computeDeliveryFee(Product::class, $validated['delivery_method'], $quantity),
            ]);

            $this->syncProductListingStatus($lockedProduct->refresh());

            return $reservation;
        });

        $reservation = $this->reservations->loadForResponse($reservation);
        $reservation->seller?->notify(new ReservationRequestedNotification($reservation));

        return $reservation;
    }

    public function approve(Reservation $reservation): Reservation
    {
        $reservation = DB::transaction(function () use ($reservation): Reservation {
            $lockedReservation = $this->reservations->lockForUpdate($reservation);

            abort_if($lockedReservation->reservation_status !== 'pending', 422, 'Seules les reservations en attente peuvent etre approuvees.');

            $lockedReservation->update([
                'reservation_status' => 'approved',
                'delivery_status' => $lockedReservation->delivery_method === 'pickup'
                    ? 'ready_for_pickup'
                    : 'preparing',
                'approved_at' => CarbonImmutable::now(),
            ]);

            return $lockedReservation;
        });

        $reservation = $this->reservations->loadForResponse($reservation);
        $reservation->buyer?->notify(new ReservationApprovedNotification($reservation));

        return $reservation;
    }

    public function updateDeliveryStatus(Reservation $reservation, string $nextStatus): Reservation
    {
        $reservation = DB::transaction(function () use ($reservation, $nextStatus): Reservation {
            $lockedReservation = $this->reservations->lockForUpdate($reservation);

            abort_if($lockedReservation->reservation_status !== 'approved', 422, 'La livraison ne peut etre mise a jour que pour une reservation approuvee.');
            abort_if(
                ! $this->canTransitionDeliveryStatus($lockedReservation, $nextStatus),
                422,
                'Transition de livraison invalide pour cette reservation.',
            );

            $lockedReservation->update([
                'delivery_status' => $nextStatus,
            ]);

            return $lockedReservation;
        });

        $reservation = $this->reservations->loadForResponse($reservation);
        $reservation->buyer?->notify(new ReservationDeliveryUpdatedNotification($reservation));

        return $reservation;
    }

    public function reject(Reservation $reservation): Reservation
    {
        $reservation = DB::transaction(function () use ($reservation): Reservation {
            $lockedReservation = $this->reservations->lockForUpdate($reservation);

            abort_if($lockedReservation->reservation_status !== 'pending', 422, 'Seules les reservations en attente peuvent etre refusees.');

            $lockedReservation->update([
                'reservation_status' => 'rejected',
                'payment_status' => 'cancelled',
            ]);

            $this->lockReservableForUpdate($lockedReservation);
            $this->syncReservableAfterRelease($lockedReservation);

            return $lockedReservation;
        });

        $reservation = $this->reservations->loadForResponse($reservation);
        $reservation->buyer?->notify(new ReservationRejectedNotification($reservation));

        return $reservation;
    }

    public function cancel(Reservation $reservation): Reservation
    {
        $reservation = DB::transaction(function () use ($reservation): Reservation {
            $lockedReservation = $this->reservations->lockForUpdate($reservation);

            abort_if(
                ! in_array($lockedReservation->reservation_status, ['pending', 'approved'], true),
                422,
                'Cette reservation ne peut plus etre annulee.',
            );
            abort_if(
                in_array($lockedReservation->delivery_status, ['shipped', 'delivered', 'picked_up'], true),
                422,
                'Cette reservation ne peut plus etre annulee car la livraison est deja trop avancee.',
            );

            $lockedReservation->update([
                'reservation_status' => 'cancelled',
                'payment_status' => 'cancelled',
                'cancelled_at' => CarbonImmutable::now(),
            ]);

            $this->lockReservableForUpdate($lockedReservation);
            $this->syncReservableAfterRelease($lockedReservation);

            return $lockedReservation;
        });

        $reservation = $this->reservations->loadForResponse($reservation);
        $reservation->seller?->notify(new ReservationCancelledNotification($reservation));

        return $reservation;
    }

    public function complete(Reservation $reservation): Reservation
    {
        $reservation = DB::transaction(function () use ($reservation): Reservation {
            $lockedReservation = $this->reservations->lockForUpdate($reservation);

            abort_if($lockedReservation->reservation_status !== 'approved', 422, 'Seules les reservations approuvees peuvent etre finalisees.');
            abort_if(! $this->isDeliveryAtCompletionStep($lockedReservation), 422, 'La livraison doit etre terminee avant de finaliser la commande.');

            $lockedReservation->update([
                'reservation_status' => 'completed',
                'payment_status' => 'paid',
                'invoice_number' => $lockedReservation->invoice_number ?: $this->generateInvoiceNumber($lockedReservation),
                'invoice_issued_at' => CarbonImmutable::now(),
                'completed_at' => CarbonImmutable::now(),
            ]);

            $reservable = $this->lockReservableForUpdate($lockedReservation);

            if ($reservable instanceof Animal) {
                $reservable->update([
                    'listing_status' => $reservable->is_for_adoption ? 'adopted' : 'sold',
                ]);
            }

            if ($reservable instanceof Product) {
                $reservable->update([
                    'stock' => max(0, (int) $reservable->stock - (int) $lockedReservation->quantity),
                ]);

                $this->syncProductListingStatus($reservable->refresh());
            }

            return $lockedReservation;
        });

        $reservation = $this->reservations->loadForResponse($reservation);
        $reservation->buyer?->notify(new ReservationCompletedNotification($reservation));

        return $reservation;
    }

    /**
     * @return array<int, string>
     */
    protected function activeStatuses(): array
    {
        return ['pending', 'approved'];
    }

    protected function computeDeliveryFee(string $reservableType, string $deliveryMethod, int $quantity): float
    {
        if ($deliveryMethod === 'pickup') {
            return 0.0;
        }

        if ($reservableType === Animal::class) {
            return 60.0;
        }

        return 35.0 + max(0, $quantity - 1) * 5.0;
    }

    protected function availableProductQuantity(Product $product): int
    {
        $activeQuantity = (int) $product->reservations()
            ->whereIn('reservation_status', $this->activeStatuses())
            ->sum('quantity');

        return max(0, (int) $product->stock - $activeQuantity);
    }

    protected function syncProductListingStatus(Product $product): void
    {
        $availableQuantity = $this->availableProductQuantity($product);

        $listingStatus = match (true) {
            (int) $product->stock <= 0 => 'sold',
            $availableQuantity <= 0 => 'reserved',
            default => 'available',
        };

        if ($product->listing_status !== $listingStatus) {
            $product->update([
                'listing_status' => $listingStatus,
            ]);
        }
    }

    protected function syncReservableAfterRelease(Reservation $reservation): void
    {
        $reservable = $reservation->reservable;

        if ($reservable instanceof Animal) {
            if (! $reservable->reservations()->whereIn('reservation_status', $this->activeStatuses())->exists()) {
                $reservable->update([
                    'listing_status' => 'available',
                ]);
            }
        }

        if ($reservable instanceof Product) {
            $this->syncProductListingStatus($reservable);
        }
    }

    protected function lockReservableForUpdate(Reservation $reservation): Animal|Product|null
    {
        $reservable = $reservation->reservable;

        if ($reservable instanceof Animal) {
            $lockedAnimal = Animal::query()
                ->lockForUpdate()
                ->findOrFail($reservable->id);

            $reservation->setRelation('reservable', $lockedAnimal);

            return $lockedAnimal;
        }

        if ($reservable instanceof Product) {
            $lockedProduct = Product::query()
                ->lockForUpdate()
                ->findOrFail($reservable->id);

            $reservation->setRelation('reservable', $lockedProduct);

            return $lockedProduct;
        }

        return null;
    }

    protected function canTransitionDeliveryStatus(Reservation $reservation, string $nextStatus): bool
    {
        $allowedTransitions = $reservation->delivery_method === 'pickup'
            ? [
                'pending' => ['ready_for_pickup'],
                'ready_for_pickup' => ['picked_up'],
            ]
            : [
                'pending' => ['preparing'],
                'preparing' => ['shipped'],
                'shipped' => ['delivered'],
            ];

        return in_array($nextStatus, $allowedTransitions[$reservation->delivery_status] ?? [], true);
    }

    protected function isDeliveryAtCompletionStep(Reservation $reservation): bool
    {
        return $reservation->delivery_method === 'pickup'
            ? $reservation->delivery_status === 'picked_up'
            : $reservation->delivery_status === 'delivered';
    }

    protected function generateInvoiceNumber(Reservation $reservation): string
    {
        return sprintf('YAZ-%s-%05d', now()->format('Ymd'), $reservation->id);
    }
}
