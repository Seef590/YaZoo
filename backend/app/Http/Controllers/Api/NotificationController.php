<?php

namespace App\Http\Controllers\Api;

use App\DTOs\PaginationData;
use App\Http\Controllers\Controller;
use App\Http\Resources\Notification\NotificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $pagination = PaginationData::fromRequest($request, 20, 50);

        $notifications = $request->user()
            ->notifications()
            ->orderByDesc('created_at')
            ->paginate($pagination->perPage);

        return NotificationResource::collection($notifications);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'unreadCount' => $request->user()->unreadNotifications()->count(),
            ],
        ]);
    }

    public function markAsRead(Request $request, string $notification): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->whereKey($notification);

        (clone $notifications)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $databaseNotification = $notifications->firstOrFail();

        return response()->json([
            'message' => __('messages.notifications.read'),
            'data' => NotificationResource::make($databaseNotification)->resolve(),
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $markedCount = $request->user()
            ->unreadNotifications()
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => __('messages.notifications.all_read'),
            'data' => [
                'markedCount' => $markedCount,
                'unreadCount' => 0,
            ],
        ]);
    }
}
