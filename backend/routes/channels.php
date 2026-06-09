<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('users.{userId}', function ($user, int $userId): bool {
    return (int) $user->id === $userId;
});

Broadcast::channel('conversations.{conversationId}', function ($user, int $conversationId): bool {
    return Conversation::query()
        ->whereKey($conversationId)
        ->first(['id', 'participant_one_id', 'participant_two_id'])
        ?->hasParticipant((int) $user->id) ?? false;
});
