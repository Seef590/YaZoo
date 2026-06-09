<?php

namespace App\Support\Sms;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsSender
{
    /**
     * Send an SMS using the configured provider.
     */
    public function send(string $phone, string $message): void
    {
        $driver = (string) config('services.sms.driver', 'log');

        if ($driver === 'twilio') {
            $this->sendViaTwilio($phone, $message);

            return;
        }

        if ($driver === 'orange') {
            $this->sendViaOrange($phone, $message);

            return;
        }

        $this->sendViaLog($phone, $message);
    }

    protected function sendViaLog(string $phone, string $message): void
    {
        Log::info('YaZoo OTP SMS (log driver)', [
            'phone' => $phone,
            'message' => $message,
        ]);
    }

    protected function sendViaTwilio(string $phone, string $message): void
    {
        $sid = (string) config('services.sms.twilio.sid', '');
        $token = (string) config('services.sms.twilio.token', '');
        $from = (string) config('services.sms.twilio.from', '');

        if ($sid === '' || $token === '' || $from === '') {
            $this->sendViaLog($phone, $message);

            return;
        }

        Http::asForm()
            ->withBasicAuth($sid, $token)
            ->post(sprintf('https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json', $sid), [
                'From' => $from,
                'To' => $phone,
                'Body' => $message,
            ])
            ->throw();
    }

    protected function sendViaOrange(string $phone, string $message): void
    {
        $baseUrl = (string) config('services.sms.orange.base_url', '');
        $token = (string) config('services.sms.orange.token', '');
        $sender = (string) config('services.sms.orange.sender', 'YaZoo');

        if ($baseUrl === '' || $token === '') {
            $this->sendViaLog($phone, $message);

            return;
        }

        Http::withToken($token)
            ->post(rtrim($baseUrl, '/').'/messages', [
                'sender' => $sender,
                'recipient' => $phone,
                'message' => $message,
            ])
            ->throw();
    }
}
