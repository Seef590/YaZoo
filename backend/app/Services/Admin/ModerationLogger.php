<?php

namespace App\Services\Admin;

use App\Models\ModerationAction;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ModerationLogger
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function log(
        Request $request,
        string $action,
        Model|User $target,
        ?string $reason = null,
        array $metadata = [],
    ): ModerationAction {
        return ModerationAction::query()->create([
            'admin_id' => $request->user()->id,
            'action' => $action,
            'target_type' => $target::class,
            'target_id' => $target->getKey(),
            'reason' => $reason,
            'metadata' => $this->sanitizeMetadata($metadata),
            'ip_hash' => $this->hashValue($request->ip()),
            'user_agent_hash' => $this->hashValue($request->userAgent()),
        ]);
    }

    /**
     * @param  array<string, mixed>  $metadata
     * @return array<string, mixed>
     */
    private function sanitizeMetadata(array $metadata): array
    {
        $blockedKeys = ['password', 'token', 'secret', 'otp', 'remember_token'];

        return collect($metadata)
            ->reject(fn ($value, string $key): bool => in_array(strtolower($key), $blockedKeys, true))
            ->all();
    }

    private function hashValue(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        return hash('sha256', $value.'|'.config('app.key'));
    }
}
