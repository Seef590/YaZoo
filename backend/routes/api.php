<?php

use App\Http\Controllers\Api\AdminModerationController;
use App\Http\Controllers\Api\AdminOrdersController;
use App\Http\Controllers\Api\AnimalController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\MonitoringController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\ReservationReviewController;
use App\Http\Controllers\Api\StoryController;
use App\Http\Controllers\Api\UserController;
use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\SetApiLocale;
use App\Http\Middleware\UseSanctumTokenFromCookie;
use Illuminate\Support\Facades\Route;

Route::middleware([ForceJsonResponse::class, SetApiLocale::class, 'throttle:api'])->group(function (): void {
    Route::get('/', fn () => response()->json([
        'name' => 'YaZoo API',
        'status' => 'ok',
    ]));

    Route::get('/media/{fileId}', [MediaController::class, 'show'])
        ->where('fileId', '[A-Fa-f0-9]{24}');

    Route::post('/monitoring/frontend-error', [MonitoringController::class, 'store'])
        ->middleware('throttle:10,1');

    Route::prefix('auth')->group(function (): void {
        Route::post('/otp/request', [AuthController::class, 'requestOtp'])->middleware('throttle:5,1');
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

        Route::middleware([UseSanctumTokenFromCookie::class, 'auth:sanctum'])->group(function (): void {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware([UseSanctumTokenFromCookie::class, 'auth:sanctum'])->group(function (): void {
        Route::get('/posts', [PostController::class, 'index']);
        Route::middleware('throttle:feed-write')->group(function (): void {
            Route::post('/posts', [PostController::class, 'store']);
            Route::post('/posts/{post}/like', [PostController::class, 'toggleLike']);
            Route::post('/posts/{post}/comments', [CommentController::class, 'store']);
        });

        Route::get('/stories', [StoryController::class, 'index']);
        Route::middleware('throttle:stories-write')->group(function (): void {
            Route::post('/stories', [StoryController::class, 'store']);
            Route::post('/stories/{story}/view', [StoryController::class, 'markAsViewed']);
            Route::delete('/stories/{story}', [StoryController::class, 'destroy']);
        });

        Route::get('/users/{user}', [ProfileController::class, 'show']);
        Route::patch('/users/{user}', [ProfileController::class, 'update']);

        Route::get('/animals', [AnimalController::class, 'index']);
        Route::get('/animals/{animal}', [AnimalController::class, 'show']);

        Route::get('/products', [ProductController::class, 'index']);
        Route::get('/products/{product}', [ProductController::class, 'show']);

        Route::middleware('throttle:marketplace-write')->group(function (): void {
            Route::post('/animals', [AnimalController::class, 'store']);
            Route::put('/animals/{animal}', [AnimalController::class, 'update']);
            Route::delete('/animals/{animal}', [AnimalController::class, 'destroy']);
            Route::post('/products', [ProductController::class, 'store']);
            Route::put('/products/{product}', [ProductController::class, 'update']);
            Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        });

        Route::get('/reservations', [ReservationController::class, 'index']);
        Route::get('/orders/history', [ReservationController::class, 'history']);
        Route::get('/reservations/{reservation}/invoice', [ReservationController::class, 'invoice']);
        Route::middleware('throttle:reservations-write')->group(function (): void {
            Route::post('/animals/{animal}/reservations', [ReservationController::class, 'storeAnimal']);
            Route::post('/products/{product}/reservations', [ReservationController::class, 'storeProduct']);
            Route::post('/reservations/{reservation}/approve', [ReservationController::class, 'approve']);
            Route::post('/reservations/{reservation}/reject', [ReservationController::class, 'reject']);
            Route::patch('/reservations/{reservation}/delivery-status', [ReservationController::class, 'updateDeliveryStatus']);
            Route::post('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);
            Route::post('/reservations/{reservation}/complete', [ReservationController::class, 'complete']);
            Route::post('/reservations/{reservation}/reviews', [ReservationReviewController::class, 'store']);
        });

        Route::get('/communities', [CommunityController::class, 'index']);
        Route::post('/communities', [CommunityController::class, 'store']);
        Route::get('/communities/{community}', [CommunityController::class, 'show']);
        Route::put('/communities/{community}', [CommunityController::class, 'update']);
        Route::post('/communities/{community}/join', [CommunityController::class, 'join']);
        Route::delete('/communities/{community}/leave', [CommunityController::class, 'leave']);
        Route::get('/communities/{community}/membership-requests', [CommunityController::class, 'pendingRequests']);
        Route::post('/communities/{community}/membership-requests/{membership}/approve', [CommunityController::class, 'approveRequest']);
        Route::delete('/communities/{community}/membership-requests/{membership}', [CommunityController::class, 'rejectRequest']);

        Route::get('/conversations', [ConversationController::class, 'index']);
        Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
        Route::middleware('throttle:messages-write')->group(function (): void {
            Route::post('/conversations', [ConversationController::class, 'store']);
            Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);
        });

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

        Route::prefix('admin')->group(function (): void {
            Route::get('/users', [UserController::class, 'index']);
            Route::post('/users', [UserController::class, 'store']);
            Route::get('/orders', [AdminOrdersController::class, 'index']);
            Route::get('/moderation', [AdminModerationController::class, 'index']);
            Route::delete('/posts/{post}', [AdminModerationController::class, 'destroyPost']);
            Route::delete('/animals/{animal}', [AdminModerationController::class, 'destroyAnimal']);
            Route::delete('/products/{product}', [AdminModerationController::class, 'destroyProduct']);
            Route::delete('/communities/{community}', [AdminModerationController::class, 'destroyCommunity']);
        });
    });
});
