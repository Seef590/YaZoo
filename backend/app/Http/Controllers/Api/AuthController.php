<?php

namespace App\Http\Controllers\Api;

use App\DTOs\Auth\AuthResult;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\RequestOtpRequest;
use App\Services\AuthService;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $auth,
    ) {}

    public function requestOtp(RequestOtpRequest $request): JsonResponse
    {
        $result = $this->auth->requestOtp($request->validated());

        return response()->json([
            'message' => $result->message,
            'expires_at' => $result->expiresAt,
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $result = $this->auth->register($request->validated());
        } catch (LockTimeoutException) {
            return response()->json([
                'message' => __('messages.auth.register_temporarily_unavailable'),
            ], 503);
        }

        return $this->authResponse(
            $result,
            __('messages.auth.account_created'),
            201,
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        return $this->authResponse(
            $this->auth->login($request->validated()),
            __('messages.auth.login_success'),
        );
    }

    public function redirectToGoogle(): RedirectResponse
    {
        $clientId = trim((string) config('services.google.client_id'));
        $clientSecret = trim((string) config('services.google.client_secret'));
        $redirectUri = trim((string) config('services.google.redirect'));

        if ($clientId === '' || $clientSecret === '' || $redirectUri === '') {
            $frontendRedirect = (string) config('services.google.login_redirect');
            $separator = str_contains($frontendRedirect, '?') ? '&' : '?';

            return redirect()->away($frontendRedirect.$separator.'auth_error=google_not_configured');
        }

        return Socialite::driver('google')
            ->stateless()
            ->scopes(['openid', 'email', 'profile'])
            ->redirect();
    }

    public function handleGoogleCallback(): RedirectResponse
    {
        $frontendRedirect = (string) config('services.google.frontend_redirect');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            $result = $this->auth->loginWithGoogle($googleUser);

            return redirect()
                ->away($frontendRedirect)
                ->withCookie($this->auth->makeAuthCookie($result->plainTextToken));
        } catch (Throwable) {
            $separator = str_contains($frontendRedirect, '?') ? '&' : '?';

            return redirect()->away($frontendRedirect.$separator.'auth_error=google');
        }
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->auth->userPayload($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => __('messages.auth.logout_success'),
        ])->withCookie($this->auth->expireAuthCookie());
    }

    protected function authResponse(AuthResult $result, string $message, int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'user' => $this->auth->userPayload($result->user),
        ], $statusCode)->withCookie($this->auth->makeAuthCookie($result->plainTextToken));
    }
}
