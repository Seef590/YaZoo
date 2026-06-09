<?php

namespace App\Services;

use App\DTOs\Auth\AuthResult;
use App\DTOs\Auth\OtpDispatchResult;
use App\Models\User;
use App\Support\Auth\PhoneOtpBroker;
use App\Support\MediaStorage;
use App\Support\PhoneNumber;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Cookie;

class AuthService
{
    public function __construct(
        protected PhoneOtpBroker $phoneOtpBroker,
    ) {}

    /**
     * @param  array<string, mixed>  $validated
     */
    public function requestOtp(array $validated): OtpDispatchResult
    {
        $phone = PhoneNumber::normalize($validated['phone'] ?? null) ?? (string) $validated['phone'];
        $intent = (string) $validated['intent'];

        if ($intent === 'login' && ! User::query()->where('phone', $phone)->exists()) {
            throw ValidationException::withMessages([
                'phone' => [__('messages.auth.phone_not_found')],
            ]);
        }

        if ($intent === 'register' && User::query()->where('phone', $phone)->exists()) {
            throw ValidationException::withMessages([
                'phone' => [__('messages.auth.phone_already_exists')],
            ]);
        }

        $otpPayload = $this->phoneOtpBroker->send($phone, $intent);

        return new OtpDispatchResult(
            $intent === 'login'
                ? __('messages.auth.otp_sent_login')
                : __('messages.auth.otp_sent_register'),
            (string) $otpPayload['expires_at'],
        );
    }

    /**
     * @param  array<string, mixed>  $validated
     *
     * @throws LockTimeoutException
     */
    public function register(array $validated): AuthResult
    {
        $phone = $validated['phone'] ?? null;

        $user = Cache::lock('auth:first-admin-bootstrap', 10)->block(
            5,
            fn (): User => DB::transaction(function () use ($validated, $phone): User {
                $isFirstAdmin = ! User::query()->where('is_admin', true)->exists();
                $hasOtp = filled($validated['otp_code'] ?? null);

                if ($hasOtp) {
                    if (! $phone) {
                        throw ValidationException::withMessages([
                            'phone' => [__('validation.required', ['attribute' => 'telephone'])],
                        ]);
                    }

                    $this->phoneOtpBroker->consume($phone, 'register', (string) $validated['otp_code']);
                }

                return User::create([
                    'name' => $validated['name'],
                    'email' => $this->resolveEmail($validated['email'] ?? null, $phone),
                    'password' => $validated['password'] ?? Str::random(32),
                    'phone' => $phone,
                    'phone_verified_at' => $hasOtp && $phone ? now() : null,
                    'preferred_locale' => $validated['preferred_locale'] ?? app()->getLocale(),
                    'country' => $validated['country'] ?? null,
                    'city' => $validated['city'] ?? null,
                    'is_admin' => $isFirstAdmin,
                ]);
            }),
        );

        return new AuthResult(
            $user,
            $this->createPlainTextToken($user, (string) ($validated['device_name'] ?? 'yazoo-web')),
        );
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    public function login(array $validated): AuthResult
    {
        if (filled($validated['phone'] ?? null) && filled($validated['otp_code'] ?? null)) {
            $phone = (string) $validated['phone'];
            $this->phoneOtpBroker->consume($phone, 'login', (string) $validated['otp_code']);

            $user = User::query()->where('phone', $phone)->first();

            if (! $user) {
                throw ValidationException::withMessages([
                    'phone' => [__('messages.auth.phone_not_found')],
                ]);
            }

            if (! $user->hasVerifiedPhone()) {
                $user->forceFill([
                    'phone_verified_at' => now(),
                ])->save();
            }

            return new AuthResult(
                $user,
                $this->createPlainTextToken($user, (string) ($validated['device_name'] ?? 'yazoo-web')),
            );
        }

        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check((string) $validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('messages.auth.invalid_credentials')],
            ]);
        }

        return new AuthResult(
            $user,
            $this->createPlainTextToken($user, (string) ($validated['device_name'] ?? 'yazoo-web')),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function userPayload(?User $user): array
    {
        if (! $user) {
            return [];
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->publicEmail(),
            'phone' => $user->phone,
            'country' => $user->country,
            'city' => $user->city,
            'bio' => $user->bio,
            'avatar' => MediaStorage::resolveUrl($user->avatar),
            'cover_photo' => MediaStorage::resolveUrl($user->cover_photo),
            'isAdmin' => (bool) $user->is_admin,
            'isPhoneVerified' => $user->hasVerifiedPhone(),
            'preferredLocale' => $user->preferred_locale ?? 'fr',
            'created_at' => $user->created_at?->toISOString(),
            'updated_at' => $user->updated_at?->toISOString(),
        ];
    }

    public function makeAuthCookie(string $token): Cookie
    {
        $expiration = (int) (config('sanctum.expiration') ?? 0);
        $minutes = $expiration > 0 ? $expiration : 60 * 24 * 7;

        return cookie(
            'yazoo_api_token',
            Crypt::encryptString($token),
            $minutes,
            '/',
            config('session.domain'),
            (bool) (config('session.secure') ?? request()->isSecure()),
            true,
            false,
            'lax',
        );
    }

    public function expireAuthCookie(): Cookie
    {
        return cookie()->forget(
            'yazoo_api_token',
            '/',
            config('session.domain'),
        );
    }

    protected function createPlainTextToken(User $user, string $deviceName): string
    {
        return $user
            ->createToken($deviceName, ['*'])
            ->plainTextToken;
    }

    protected function resolveEmail(?string $email, ?string $phone): string
    {
        $trimmedEmail = is_string($email) ? trim($email) : null;

        if ($trimmedEmail) {
            return $trimmedEmail;
        }

        if ($phone === null) {
            return sprintf(
                'user.%s@%s',
                Str::lower(Str::random(12)),
                PhoneNumber::PLACEHOLDER_EMAIL_DOMAIN,
            );
        }

        return PhoneNumber::placeholderEmail($phone);
    }
}
