<?php

namespace Tests\Feature\Admin;

use App\Models\Animal;
use App\Models\Product;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminOrdersApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_admin_orders_dashboard(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/admin/orders')
            ->assertForbidden()
            ->assertJsonPath('message', 'Acces reserve aux admins.');
    }

    public function test_admin_can_view_orders_dashboard_with_stats_and_sections(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-04-03 12:00:00'));

        try {
            $admin = User::factory()->admin()->create();
            $sellerOne = User::factory()->create(['name' => 'Vendeur One']);
            $sellerTwo = User::factory()->create(['name' => 'Vendeur Two']);
            $buyerOne = User::factory()->create(['name' => 'Acheteur One']);
            $buyerTwo = User::factory()->create(['name' => 'Acheteur Two']);

            $animal = Animal::factory()->create([
                'user_id' => $sellerOne->id,
                'name' => 'Milo',
                'listing_status' => 'reserved',
                'price' => 1800,
            ]);

            $product = Product::factory()->create([
                'user_id' => $sellerTwo->id,
                'name' => 'Cage premium',
                'listing_status' => 'available',
                'stock' => 4,
                'price' => 250,
            ]);

            $pendingReservation = Reservation::factory()->create([
                'buyer_id' => $buyerOne->id,
                'seller_id' => $sellerOne->id,
                'reservable_type' => Animal::class,
                'reservable_id' => $animal->id,
                'delivery_method' => 'delivery',
                'delivery_status' => 'pending',
                'payment_method' => 'bank_transfer',
                'reservation_status' => 'pending',
                'payment_status' => 'pending',
                'unit_price' => 1800,
                'total_price' => 1800,
                'delivery_fee' => 60,
                'created_at' => Carbon::parse('2026-04-03 10:00:00'),
                'updated_at' => Carbon::parse('2026-04-03 10:00:00'),
            ]);

            $approvedReservation = Reservation::factory()->create([
                'buyer_id' => $buyerTwo->id,
                'seller_id' => $sellerTwo->id,
                'reservable_type' => Product::class,
                'reservable_id' => $product->id,
                'quantity' => 2,
                'delivery_method' => 'delivery',
                'delivery_status' => 'shipped',
                'payment_method' => 'cash_on_pickup',
                'reservation_status' => 'approved',
                'payment_status' => 'pending',
                'unit_price' => 250,
                'total_price' => 500,
                'delivery_fee' => 40,
                'approved_at' => Carbon::parse('2026-04-03 09:30:00'),
                'created_at' => Carbon::parse('2026-04-03 09:00:00'),
                'updated_at' => Carbon::parse('2026-04-03 09:30:00'),
            ]);

            $completedReservation = Reservation::factory()->create([
                'buyer_id' => $buyerOne->id,
                'seller_id' => $sellerTwo->id,
                'reservable_type' => Product::class,
                'reservable_id' => $product->id,
                'quantity' => 1,
                'delivery_method' => 'pickup',
                'delivery_status' => 'picked_up',
                'payment_method' => 'bank_transfer',
                'reservation_status' => 'completed',
                'payment_status' => 'paid',
                'unit_price' => 250,
                'total_price' => 250,
                'delivery_fee' => 0,
                'invoice_number' => 'YAZ-20260403-00003',
                'invoice_issued_at' => Carbon::parse('2026-04-03 08:45:00'),
                'completed_at' => Carbon::parse('2026-04-03 08:45:00'),
                'created_at' => Carbon::parse('2026-04-03 08:00:00'),
                'updated_at' => Carbon::parse('2026-04-03 08:45:00'),
            ]);

            Sanctum::actingAs($admin, ['*']);

            $this->getJson('/api/admin/orders')
                ->assertOk()
                ->assertJsonPath('stats.totalOrders', 3)
                ->assertJsonPath('stats.pendingReservations', 1)
                ->assertJsonPath('stats.approvedOrders', 1)
                ->assertJsonPath('stats.completedOrders', 1)
                ->assertJsonPath('stats.revenueTotal', 250)
                ->assertJsonPath('stats.inTransitDeliveries', 1)
                ->assertJsonPath('stats.animalOrders', 1)
                ->assertJsonPath('stats.productOrders', 2)
                ->assertJsonPath('activeOrders.0.id', $pendingReservation->id)
                ->assertJsonPath('activeOrders.1.id', $approvedReservation->id)
                ->assertJsonPath('activeOrders.1.deliveryStatus', 'shipped')
                ->assertJsonPath('recentCompletedOrders.0.id', $completedReservation->id)
                ->assertJsonPath('recentCompletedOrders.0.invoiceNumber', 'YAZ-20260403-00003')
                ->assertJsonPath('topSellers.0.seller.name', 'Vendeur Two')
                ->assertJsonPath('topSellers.0.completedOrders', 1)
                ->assertJsonPath('topSellers.0.revenueTotal', 250);
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_admin_can_view_completed_reservation_invoice(): void
    {
        $admin = User::factory()->admin()->create();
        $seller = User::factory()->create();
        $buyer = User::factory()->create();
        $animal = Animal::factory()->create([
            'user_id' => $seller->id,
            'name' => 'Nina',
        ]);

        $reservation = Reservation::factory()->create([
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'reservable_type' => Animal::class,
            'reservable_id' => $animal->id,
            'delivery_method' => 'pickup',
            'delivery_status' => 'picked_up',
            'reservation_status' => 'completed',
            'payment_status' => 'paid',
            'invoice_number' => 'YAZ-20260403-00010',
            'invoice_issued_at' => now(),
            'completed_at' => now(),
        ]);

        Sanctum::actingAs($admin, ['*']);

        $this->getJson("/api/reservations/{$reservation->id}/invoice")
            ->assertOk()
            ->assertJsonPath('data.invoiceNumber', 'YAZ-20260403-00010')
            ->assertJsonPath('data.listing.title', 'Nina');
    }
}
