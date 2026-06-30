<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Post;
use App\Models\Product;
use App\Models\Report;
use App\Models\Reservation;
use App\Models\ServiceListing;
use App\Models\User;
use App\Models\Veterinarian;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminStatsController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        abort_unless((bool) $request->user()?->is_admin, 403);

        $sevenDaysAgo = now()->subDays(7);

        return response()->json([
            'total_users' => User::query()->count(),
            'total_posts' => Post::query()->count(),
            'total_animals' => Animal::query()->count(),
            'total_products' => Product::query()->count(),
            'total_services' => ServiceListing::query()->count(),
            'total_veterinarians' => Veterinarian::query()->count(),
            'total_conversations' => Conversation::query()->count(),
            'total_messages' => Message::query()->count(),
            'total_reports_pending' => Report::query()->where('status', 'pending')->count(),
            'total_reservations' => Reservation::query()->count(),
            'users_last_7_days' => User::query()->where('created_at', '>=', $sevenDaysAgo)->count(),
            'posts_last_7_days' => Post::query()->where('created_at', '>=', $sevenDaysAgo)->count(),
            'reports_last_7_days' => Report::query()->where('created_at', '>=', $sevenDaysAgo)->count(),
        ]);
    }
}
