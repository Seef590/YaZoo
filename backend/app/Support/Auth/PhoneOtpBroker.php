<?php

namespace App\Support\Auth;

use App\Support\PhoneNumber;
use App\Support\Sms\SmsSender;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PhoneOtpBroker
{
    public function __construct(
        protected SmsSender $smsSender,
    ) {}

    /**
     * Send an OTP code for the given phone number and intent.
     *
     * @return array{debug_code: string|null, expires_at: string}
     */
    public function send(string $phone, string $intent): array
    {
        $normalizedPhone = PhoneNumber::normalize($phone);

        if ($normalizedPhone === null) {
            throw ValidationException::withMessages([
                'phone' => [__('messages.auth.invalid_phone')],
            ]);
        }

        $code = (string) random_int(100000, 999999);
        $expiresAt = CarbonImmutable::now()->addMinutes((int) config('services.sms.otp_ttl', 5));

        Cache::put($this->cacheKey($normalizedPhone, $intent), [
            'code_hash' => Hash::make($code),
            'expires_at' => $expiresAt->toIso8601String(),
        ], $expiresAt);

        $message = __('messages.auth.otp_sms', [
            'code' => $code,
            'minutes' => (int) config('services.sms.otp_ttl', 5),
        ]);

        $this->smsSender->send($normalizedPhone, $message);

        return [
            'debug_code' => app()->isLocal() || app()->runningUnitTests() || (bool) config('app.debug')
                ? $code
                : null,
            'expires_at' => $expiresAt->toIso8601String(),
        ];
    }

    /**
     * Consume and validate the submitted OTP code.
     */
    public function consume(string $phone, string $intent, string $code): void
    {
        $normalizedPhone = PhoneNumber::normalize($phone);
        $payload = $normalizedPhone ? Cache::get($this->cacheKey($normalizedPhone, $intent)) : null;

        if (! is_array($payload) || ! isset($payload['code_hash'])) {
            throw ValidationException::withMessages([
                'otp_code' => [__('messages.auth.otp_missing')],
            ]);
        }

        if (! Hash::check($code, (string) $payload['code_hash'])) {
            throw ValidationException::withMessages([
                'otp_code' => [__('messages.auth.otp_invalid')],
            ]);
        }

        Cache::forget($this->cacheKey($normalizedPhone, $intent));
    }

    protected function cacheKey(string $phone, string $intent): string
    {
        return sprintf('auth:otp:%s:%s', $intent, sha1($phone));
    }
}
