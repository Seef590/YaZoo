<?php

namespace App\Http\Controllers\Api;

use App\DTOs\PaginationData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Reservation\StoreReservationRequest;
use App\Http\Requests\Reservation\UpdateDeliveryStatusRequest;
use App\Http\Resources\Reservation\InvoiceResource;
use App\Http\Resources\Reservation\ReservationResource;
use App\Models\Animal;
use App\Models\Product;
use App\Models\Reservation;
use App\Services\ReservationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function __construct(
        protected ReservationService $reservations,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Reservation::class);

        $pagination = PaginationData::fromRequest($request, 20, 50);
        $result = $this->reservations->listForUser($request->user(), $pagination->perPage);

        return response()->json([
            'buyerReservations' => $this->reservationData($result['buyer'], $request),
            'sellerReservations' => $this->reservationData($result['seller'], $request),
            'meta' => [
                'buyer' => $this->paginationMeta($result['buyer']),
                'seller' => $this->paginationMeta($result['seller']),
            ],
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Reservation::class);

        $pagination = PaginationData::fromRequest($request, 20, 50);
        $result = $this->reservations->historyForUser($request->user(), $pagination->perPage);

        return response()->json([
            'buyerHistory' => $this->reservationData($result['buyer'], $request),
            'sellerHistory' => $this->reservationData($result['seller'], $request),
            'meta' => [
                'buyer' => $this->paginationMeta($result['buyer']),
                'seller' => $this->paginationMeta($result['seller']),
            ],
        ]);
    }

    public function invoice(Reservation $reservation): InvoiceResource
    {
        $this->authorize('viewInvoice', $reservation);
        abort_if($reservation->invoice_number === null, 404, 'Facture introuvable pour cette reservation.');

        return InvoiceResource::make($this->reservations->loadInvoice($reservation));
    }

    public function storeAnimal(StoreReservationRequest $request, Animal $animal): JsonResponse
    {
        $this->authorize('createAnimal', [Reservation::class, $animal]);

        return ReservationResource::make(
            $this->reservations->createAnimal($request->user(), $animal, $request->validated()),
        )
            ->response()
            ->setStatusCode(201);
    }

    public function storeProduct(StoreReservationRequest $request, Product $product): JsonResponse
    {
        $this->authorize('createProduct', [Reservation::class, $product]);

        return ReservationResource::make(
            $this->reservations->createProduct($request->user(), $product, $request->validated()),
        )
            ->response()
            ->setStatusCode(201);
    }

    public function approve(Reservation $reservation): JsonResponse
    {
        $this->authorize('approve', $reservation);

        return $this->messageResponse(
            'Reservation approuvee avec succes.',
            $this->reservations->approve($reservation),
        );
    }

    public function updateDeliveryStatus(UpdateDeliveryStatusRequest $request, Reservation $reservation): JsonResponse
    {
        $this->authorize('updateDeliveryStatus', $reservation);

        return $this->messageResponse(
            'Statut de livraison mis a jour avec succes.',
            $this->reservations->updateDeliveryStatus(
                $reservation,
                (string) $request->validated('delivery_status'),
            ),
        );
    }

    public function reject(Reservation $reservation): JsonResponse
    {
        $this->authorize('reject', $reservation);

        return $this->messageResponse(
            'Reservation refusee.',
            $this->reservations->reject($reservation),
        );
    }

    public function cancel(Reservation $reservation): JsonResponse
    {
        $this->authorize('cancel', $reservation);

        return $this->messageResponse(
            'Reservation annulee.',
            $this->reservations->cancel($reservation),
        );
    }

    public function complete(Reservation $reservation): JsonResponse
    {
        $this->authorize('complete', $reservation);

        return $this->messageResponse(
            'Reservation finalisee avec succes.',
            $this->reservations->complete($reservation),
        );
    }

    protected function messageResponse(string $message, Reservation $reservation): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'data' => ReservationResource::make($reservation)->resolve(),
        ]);
    }

    protected function reservationData(LengthAwarePaginator $paginator, Request $request): array
    {
        return ReservationResource::collection($paginator)->resolve($request);
    }

    /**
     * @return array<string, int>
     */
    protected function paginationMeta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'last_page' => $paginator->lastPage(),
            'total' => $paginator->total(),
        ];
    }
}
