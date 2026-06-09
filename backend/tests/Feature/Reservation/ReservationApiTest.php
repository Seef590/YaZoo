<?php

namespace Tests\Feature\Reservation;

use App\Models\Animal;
use App\Models\Product;
use App\Models\Reservation;
use App\Models\User;
use App\Notifications\ReservationApprovedNotification;
use App\Notifications\ReservationCompletedNotification;
use App\Notifications\ReservationDeliveryUpdatedNotification;
use App\Notifications\ReservationRejectedNotification;
use App\Notifications\ReservationRequestedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReservationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_create_an_animal_reservation_and_notify_the_seller(): void
    {
        Notification::fake();

        $seller = User::factory()->create();
        $buyer = User::factory()->create();
        $animal = Animal::factory()->create([
            'user_id' => $seller->id,
            'listing_status' => 'available',
            'price' => 950,
            'is_for_adoption' => false,
        ]);

        Sanctum::actingAs($buyer, ['*']);

        $this->postJson("/api/animals/{$animal->id}/reservations", [
            'payment_method' => 'cash_on_pickup',
            'delivery_method' => 'pickup',
            'note' => 'Je peux passer demain.',
        ])
            ->assertCreated()
            ->assertJsonPath('data.kind', 'animal')
            ->assertJsonPath('data.reservationStatus', 'pending')
            ->assertJsonPath('data.paymentStatus', 'pending')
            ->assertJsonPath('data.deliveryMethod', 'pickup')
            ->assertJsonPath('data.quantity', 1)
            ->assertJsonPath('data.totalPrice', 950)
            ->assertJsonPath('data.deliveryFee', 0);

        $this->assertDatabaseHas('reservations', [
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'reservable_type' => Animal::class,
            'reservable_id' => $animal->id,
            'reservation_status' => 'pending',
        ]);

        $this->assertSame('reserved', $animal->refresh()->listing_status);
        Notification::assertSentTo($seller, ReservationRequestedNotification::class);
    }

    public function test_seller_can_approve_and_complete_an_animal_reservation(): void
    {
        Notification::fake();

        $seller = User::factory()->create();
        $buyer = User::factory()->create();
        $animal = Animal::factory()->create([
            'user_id' => $seller->id,
            'listing_status' => 'reserved',
            'price' => 1200,
            'is_for_adoption' => false,
        ]);

        $reservation = Reservation::create([
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'reservable_type' => Animal::class,
            'reservable_id' => $animal->id,
            'quantity' => 1,
            'delivery_method' => 'pickup',
            'payment_method' => 'bank_transfer',
            'reservation_status' => 'pending',
            'payment_status' => 'pending',
            'delivery_status' => 'pending',
            'unit_price' => 1200,
            'total_price' => 1200,
            'delivery_fee' => 0,
        ]);

        Sanctum::actingAs($seller, ['*']);

        $this->postJson("/api/reservations/{$reservation->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.reservationStatus', 'approved')
            ->assertJsonPath('data.deliveryStatus', 'ready_for_pickup');

        $this->patchJson("/api/reservations/{$reservation->id}/delivery-status", [
            'delivery_status' => 'picked_up',
        ])
            ->assertOk()
            ->assertJsonPath('data.deliveryStatus', 'picked_up');

        $this->postJson("/api/reservations/{$reservation->id}/complete")
            ->assertOk()
            ->assertJsonPath('data.reservationStatus', 'completed')
            ->assertJsonPath('data.paymentStatus', 'paid')
            ->assertJsonPath('data.invoiceNumber', fn ($value) => is_string($value) && str_starts_with($value, 'YAZ-'));

        $this->assertSame('sold', $animal->refresh()->listing_status);
        Notification::assertSentTo($buyer, ReservationApprovedNotification::class);
        Notification::assertSentTo($buyer, ReservationDeliveryUpdatedNotification::class);
        Notification::assertSentTo($buyer, ReservationCompletedNotification::class);
    }

    public function test_product_reservation_completion_reduces_stock_and_rejection_reopens_stock(): void
    {
        Notification::fake();

        $seller = User::factory()->create();
        $buyer = User::factory()->create();
        $product = Product::factory()->create([
            'user_id' => $seller->id,
            'stock' => 2,
            'listing_status' => 'available',
            'price' => 300,
        ]);

        Sanctum::actingAs($buyer, ['*']);

        $createResponse = $this->postJson("/api/products/{$product->id}/reservations", [
            'quantity' => 2,
            'payment_method' => 'cash_on_pickup',
            'delivery_method' => 'delivery',
            'delivery_contact_name' => 'Acheteur YaZoo',
            'delivery_phone' => '+212600000001',
            'delivery_city' => 'Casablanca',
            'delivery_address' => 'Boulevard des animaux',
            'delivery_notes' => 'Appeler avant de livrer',
            'note' => 'Je confirme les deux exemplaires.',
        ]);

        $reservationId = $createResponse->json('data.id');

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.kind', 'product')
            ->assertJsonPath('data.totalPrice', 600)
            ->assertJsonPath('data.deliveryMethod', 'delivery')
            ->assertJsonPath('data.delivery.city', 'Casablanca');

        $this->assertSame('reserved', $product->refresh()->listing_status);

        Sanctum::actingAs($seller, ['*']);

        $this->postJson("/api/reservations/{$reservationId}/approve")
            ->assertOk()
            ->assertJsonPath('data.reservationStatus', 'approved')
            ->assertJsonPath('data.deliveryStatus', 'preparing');

        $this->patchJson("/api/reservations/{$reservationId}/delivery-status", [
            'delivery_status' => 'shipped',
        ])
            ->assertOk()
            ->assertJsonPath('data.deliveryStatus', 'shipped');

        $this->patchJson("/api/reservations/{$reservationId}/delivery-status", [
            'delivery_status' => 'delivered',
        ])
            ->assertOk()
            ->assertJsonPath('data.deliveryStatus', 'delivered');

        $this->postJson("/api/reservations/{$reservationId}/complete")
            ->assertOk()
            ->assertJsonPath('data.reservationStatus', 'completed')
            ->assertJsonPath('data.paymentStatus', 'paid')
            ->assertJsonPath('data.invoiceNumber', fn ($value) => is_string($value) && str_starts_with($value, 'YAZ-'));

        $product->refresh();

        $this->assertSame(0, $product->stock);
        $this->assertSame('sold', $product->listing_status);
    }

    public function test_reservation_rules_block_invalid_or_unauthorized_actions(): void
    {
        Notification::fake();

        $seller = User::factory()->create();
        $buyer = User::factory()->create();
        $otherBuyer = User::factory()->create();
        $product = Product::factory()->create([
            'user_id' => $seller->id,
            'stock' => 1,
            'listing_status' => 'available',
            'price' => 150,
        ]);

        Sanctum::actingAs($buyer, ['*']);

        $reservationResponse = $this->postJson("/api/products/{$product->id}/reservations", [
            'quantity' => 1,
            'payment_method' => 'bank_transfer',
            'delivery_method' => 'pickup',
        ]);

        $reservationId = $reservationResponse->json('data.id');

        $this->postJson("/api/products/{$product->id}/reservations", [
            'quantity' => 1,
            'payment_method' => 'bank_transfer',
            'delivery_method' => 'pickup',
        ])->assertUnprocessable();

        Sanctum::actingAs($seller, ['*']);

        $this->postJson("/api/products/{$product->id}/reservations", [
            'quantity' => 1,
            'payment_method' => 'cash_on_pickup',
            'delivery_method' => 'pickup',
        ])->assertForbidden();

        Sanctum::actingAs($otherBuyer, ['*']);

        $this->postJson("/api/reservations/{$reservationId}/approve")
            ->assertForbidden();

        Sanctum::actingAs($seller, ['*']);

        $this->postJson("/api/reservations/{$reservationId}/reject")
            ->assertOk()
            ->assertJsonPath('data.reservationStatus', 'rejected');

        $this->assertSame('available', $product->refresh()->listing_status);
        Notification::assertSentTo($buyer, ReservationRejectedNotification::class);
    }

    public function test_completed_orders_appear_in_history_and_invoice_is_accessible(): void
    {
        $seller = User::factory()->create();
        $buyer = User::factory()->create();
        $product = Product::factory()->create([
            'user_id' => $seller->id,
            'stock' => 3,
            'listing_status' => 'available',
            'price' => 250,
        ]);

        $reservation = Reservation::create([
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'reservable_type' => Product::class,
            'reservable_id' => $product->id,
            'quantity' => 1,
            'delivery_method' => 'delivery',
            'payment_method' => 'cash_on_pickup',
            'reservation_status' => 'completed',
            'payment_status' => 'paid',
            'delivery_status' => 'delivered',
            'delivery_contact_name' => 'Client Final',
            'delivery_phone' => '+212600000002',
            'delivery_city' => 'Rabat',
            'delivery_address' => 'Rue des commandes',
            'delivery_notes' => 'Laisser a la reception',
            'unit_price' => 250,
            'total_price' => 250,
            'delivery_fee' => 35,
            'invoice_number' => 'YAZ-20260403-00099',
            'invoice_issued_at' => now(),
            'completed_at' => now(),
        ]);

        Sanctum::actingAs($buyer, ['*']);

        $this->getJson('/api/orders/history')
            ->assertOk()
            ->assertJsonPath('buyerHistory.0.id', $reservation->id)
            ->assertJsonPath('buyerHistory.0.invoiceNumber', 'YAZ-20260403-00099');

        $this->getJson("/api/reservations/{$reservation->id}/invoice")
            ->assertOk()
            ->assertJsonPath('data.invoiceNumber', 'YAZ-20260403-00099')
            ->assertJsonPath('data.delivery.city', 'Rabat')
            ->assertJsonPath('data.grandTotal', 285);
    }
}
