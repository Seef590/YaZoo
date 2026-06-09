<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Product;
use App\Models\Reservation;
use App\Models\User;
use App\Support\MarketplaceMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AdminOrdersController extends Controller
{
    /**
     * Display the global orders dashboard for admins.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAdminDashboard', Reservation::class);

        return response()->json(Cache::remember(
            'admin:orders-dashboard:v1',
            now()->addSeconds(30),
            fn (): array => $this->dashboardPayload(),
        ));
    }

    /**
     * Build the global orders dashboard payload.
     *
     * @return array<string, mixed>
     */
    protected function dashboardPayload(): array
    {
        $activeReservations = Reservation::query()
            ->with([
                'buyer:id,name,email,avatar,city,country',
                'seller:id,name,email,avatar,city,country',
                'reservable.user:id,name,email,avatar,city,country',
            ])
            ->whereIn('reservation_status', ['pending', 'approved'])
            ->latest()
            ->take(12)
            ->get();

        $recentCompletedReservations = Reservation::query()
            ->with([
                'buyer:id,name,email,avatar,city,country',
                'seller:id,name,email,avatar,city,country',
                'reservable.user:id,name,email,avatar,city,country',
            ])
            ->where('reservation_status', 'completed')
            ->orderByDesc('completed_at')
            ->take(12)
            ->get();

        $now = now();
        $completedRevenueExpression = DB::raw('COALESCE(total_price, 0) + COALESCE(delivery_fee, 0)');

        $topSellerRows = Reservation::query()
            ->selectRaw('seller_id, COUNT(*) as completed_orders, SUM(COALESCE(total_price, 0) + COALESCE(delivery_fee, 0)) as revenue_total')
            ->where('reservation_status', 'completed')
            ->whereNotNull('seller_id')
            ->groupBy('seller_id')
            ->orderByDesc('revenue_total')
            ->take(6)
            ->get();

        $sellersById = User::query()
            ->whereIn('id', $topSellerRows->pluck('seller_id')->filter()->all())
            ->get()
            ->keyBy('id');

        return [
            'stats' => [
                'totalOrders' => Reservation::query()->count(),
                'pendingReservations' => Reservation::query()
                    ->where('reservation_status', 'pending')
                    ->count(),
                'approvedOrders' => Reservation::query()
                    ->where('reservation_status', 'approved')
                    ->count(),
                'completedOrders' => Reservation::query()
                    ->where('reservation_status', 'completed')
                    ->count(),
                'cancelledOrders' => Reservation::query()
                    ->where('reservation_status', 'cancelled')
                    ->count(),
                'rejectedOrders' => Reservation::query()
                    ->where('reservation_status', 'rejected')
                    ->count(),
                'revenueTotal' => (float) Reservation::query()
                    ->where('reservation_status', 'completed')
                    ->sum($completedRevenueExpression),
                'revenueThisMonth' => (float) Reservation::query()
                    ->where('reservation_status', 'completed')
                    ->whereBetween('completed_at', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])
                    ->sum($completedRevenueExpression),
                'inTransitDeliveries' => Reservation::query()
                    ->where('delivery_status', 'shipped')
                    ->count(),
                'readyForPickup' => Reservation::query()
                    ->where('delivery_status', 'ready_for_pickup')
                    ->count(),
                'deliveriesToPrepare' => Reservation::query()
                    ->where('delivery_status', 'preparing')
                    ->count(),
                'animalOrders' => Reservation::query()
                    ->where('reservable_type', Animal::class)
                    ->count(),
                'productOrders' => Reservation::query()
                    ->where('reservable_type', Product::class)
                    ->count(),
                'buyers' => Reservation::query()
                    ->whereNotNull('buyer_id')
                    ->distinct()
                    ->count('buyer_id'),
                'sellers' => Reservation::query()
                    ->whereNotNull('seller_id')
                    ->distinct()
                    ->count('seller_id'),
            ],
            'activeOrders' => $activeReservations
                ->map(fn (Reservation $reservation): array => $this->formatReservation($reservation))
                ->values()
                ->all(),
            'recentCompletedOrders' => $recentCompletedReservations
                ->map(fn (Reservation $reservation): array => $this->formatReservation($reservation))
                ->values()
                ->all(),
            'topSellers' => $topSellerRows
                ->map(function (object $row) use ($sellersById): array {
                    $seller = $sellersById->get($row->seller_id);
                    $ordersCount = (int) ($row->completed_orders ?? 0);
                    $revenueTotal = (float) ($row->revenue_total ?? 0);

                    return [
                        'seller' => $this->formatUser($seller),
                        'completedOrders' => $ordersCount,
                        'revenueTotal' => $revenueTotal,
                        'averageOrderValue' => $ordersCount > 0 ? round($revenueTotal / $ordersCount, 2) : 0.0,
                    ];
                })
                ->values()
                ->all(),
        ];
    }

    /**
     * Format a reservation for the admin orders dashboard.
     *
     * @return array<string, mixed>
     */
    protected function formatReservation(Reservation $reservation): array
    {
        $listing = $reservation->reservable;

        return [
            'id' => $reservation->id,
            'kind' => $reservation->reservable_type === Animal::class ? 'animal' : 'product',
            'reservationStatus' => $reservation->reservation_status,
            'paymentStatus' => $reservation->payment_status,
            'paymentMethod' => $reservation->payment_method,
            'deliveryMethod' => $reservation->delivery_method,
            'deliveryStatus' => $reservation->delivery_status,
            'quantity' => $reservation->quantity,
            'unitPrice' => $reservation->unit_price !== null ? (float) $reservation->unit_price : null,
            'totalPrice' => $reservation->total_price !== null ? (float) $reservation->total_price : null,
            'deliveryFee' => $reservation->delivery_fee !== null ? (float) $reservation->delivery_fee : null,
            'grandTotal' => $this->grandTotal($reservation),
            'invoiceNumber' => $reservation->invoice_number,
            'createdAt' => $reservation->created_at?->toISOString(),
            'approvedAt' => $reservation->approved_at?->toISOString(),
            'completedAt' => $reservation->completed_at?->toISOString(),
            'invoiceIssuedAt' => $reservation->invoice_issued_at?->toISOString(),
            'buyer' => $this->formatUser($reservation->buyer),
            'seller' => $this->formatUser($reservation->seller),
            'listing' => [
                'id' => $listing?->id,
                'title' => $listing?->name ?? 'Annonce',
                'imageUrl' => $this->listingImageUrl($reservation),
                'location' => $listing?->location,
                'routePath' => $listing?->id
                    ? ($reservation->reservable_type === Animal::class
                        ? '/marketplace/animals/'.$listing->id
                        : '/marketplace/products/'.$listing->id)
                    : null,
            ],
        ];
    }

    /**
     * Format a dashboard user payload.
     *
     * @return array<string, mixed>
     */
    protected function formatUser(?User $user): array
    {
        return [
            'id' => $user?->id,
            'name' => $user?->name,
            'email' => $user?->email,
            'avatar' => $user?->avatar,
            'city' => $user?->city,
            'country' => $user?->country,
        ];
    }

    /**
     * Resolve the listing image URL.
     */
    protected function listingImageUrl(Reservation $reservation): ?string
    {
        if ($reservation->reservable instanceof Animal) {
            return MarketplaceMedia::resolveUrl($reservation->reservable->photo_url);
        }

        if ($reservation->reservable instanceof Product) {
            return MarketplaceMedia::resolveUrl($reservation->reservable->image_url);
        }

        return null;
    }

    /**
     * Resolve the grand total including delivery.
     */
    protected function grandTotal(Reservation $reservation): float
    {
        return (float) ($reservation->total_price ?? 0) + (float) ($reservation->delivery_fee ?? 0);
    }
}
