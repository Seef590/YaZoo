<?php

namespace Tests\Unit\Auth;

use App\Support\Auth\PhoneOtpBroker;
use App\Support\Sms\SmsSender;
use ReflectionClass;
use Tests\TestCase;

class PhoneOtpBrokerTest extends TestCase
{
    public function test_cache_key_uses_keyed_hmac_without_exposing_phone(): void
    {
        $broker = new PhoneOtpBroker(new SmsSender());
        $method = (new ReflectionClass($broker))->getMethod('cacheKey');
        $phone = '+212600000010';
        $intent = 'login';

        $key = $method->invoke($broker, $phone, $intent);
        $expectedHash = hash_hmac('sha256', $phone, (string) config('app.key'));

        $this->assertSame("auth:otp:{$intent}:{$expectedHash}", $key);
        $this->assertStringNotContainsString($phone, $key);
        $this->assertSame($key, $method->invoke($broker, $phone, $intent));
        $this->assertNotSame($key, $method->invoke($broker, $phone, 'register'));
    }
}
