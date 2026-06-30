<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\DataDeletionRequest;
use App\Models\Post;
use App\Models\PrivacyConsent;
use App\Models\Product;
use App\Models\Report;
use App\Models\Reservation;
use App\Models\ServiceListing;
use App\Models\Veterinarian;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrivacyController extends Controller
{
    public function export(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'message' => __('messages.privacy.export_ready'),
            'exportedAt' => now()->toISOString(),
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->publicEmail(),
                'phone' => $user->phone,
                'city' => $user->city,
                'country' => $user->country,
                'preferredLocale' => $user->preferred_locale,
                'createdAt' => $user->created_at?->toISOString(),
            ],
            'posts' => $this->posts($user->id),
            'animals' => $this->animals($user->id),
            'products' => $this->products($user->id),
            'services' => $this->services($user->id),
            'veterinarians' => $this->veterinarians($user->id),
            'reservations' => $this->reservations($user->id),
            'reports' => $this->reports($user->id),
            'privacyConsents' => $this->privacyConsents($user->id),
            'dataDeletionRequests' => $this->dataDeletionRequests($user->id),
            // Private message bodies are intentionally excluded because they involve another user.
            'excluded' => [
                'privateMessages' => __('messages.privacy.export_private_messages_excluded'),
            ],
        ]);
    }

    private function posts(int $userId)
    {
        return Post::query()
            ->where('user_id', $userId)
            ->latest()
            ->get(['id', 'content', 'location', 'tags', 'visibility', 'created_at', 'updated_at']);
    }

    private function animals(int $userId)
    {
        return Animal::query()
            ->where('user_id', $userId)
            ->latest()
            ->get([
                'id',
                'name',
                'category',
                'type',
                'breed',
                'age',
                'sex',
                'location',
                'price',
                'is_for_adoption',
                'listing_status',
                'description',
                'contact_phone',
                'accepts_animal_rules',
                'created_at',
                'updated_at',
            ]);
    }

    private function products(int $userId)
    {
        return Product::query()
            ->where('user_id', $userId)
            ->latest()
            ->get(['id', 'name', 'category', 'description', 'price', 'location', 'stock', 'listing_status', 'condition_status', 'created_at', 'updated_at']);
    }

    private function services(int $userId)
    {
        return ServiceListing::query()
            ->where('user_id', $userId)
            ->latest()
            ->get(['id', 'type', 'title', 'description', 'animal_types', 'city', 'price', 'price_type', 'availability', 'status', 'created_at', 'updated_at']);
    }

    private function veterinarians(int $userId)
    {
        return Veterinarian::query()
            ->where('user_id', $userId)
            ->latest()
            ->get(['id', 'name', 'clinic_name', 'description', 'city', 'address', 'phone', 'whatsapp', 'email', 'specialties', 'working_hours', 'is_active', 'created_at', 'updated_at']);
    }

    private function reservations(int $userId)
    {
        return Reservation::query()
            ->where(function ($query) use ($userId): void {
                $query->where('buyer_id', $userId)
                    ->orWhere('seller_id', $userId);
            })
            ->latest()
            ->get([
                'id',
                'buyer_id',
                'seller_id',
                'reservable_type',
                'reservable_id',
                'category',
                'quantity',
                'scheduled_at',
                'scheduled_end_at',
                'delivery_method',
                'reservation_status',
                'payment_status',
                'delivery_status',
                'total_price',
                'created_at',
                'updated_at',
            ]);
    }

    private function reports(int $userId)
    {
        return Report::query()
            ->where('reporter_id', $userId)
            ->latest()
            ->get(['id', 'reportable_type', 'reportable_id', 'reason', 'details', 'status', 'reviewed_at', 'created_at', 'updated_at']);
    }

    private function privacyConsents(int $userId)
    {
        return PrivacyConsent::query()
            ->where('user_id', $userId)
            ->latest()
            ->get(['id', 'type', 'accepted', 'locale', 'accepted_at', 'created_at', 'updated_at']);
    }

    private function dataDeletionRequests(int $userId)
    {
        return DataDeletionRequest::query()
            ->where('user_id', $userId)
            ->latest()
            ->get(['id', 'reason', 'status', 'reviewed_at', 'created_at', 'updated_at']);
    }
}
