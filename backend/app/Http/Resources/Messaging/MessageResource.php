<?php

namespace App\Http\Resources\Messaging;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Message
 */
class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'body' => $this->body,
            'createdAt' => $this->created_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'readAt' => $this->read_at?->toISOString(),
            'read_at' => $this->read_at?->toISOString(),
            'isOwn' => $request->user()?->id === $this->user_id,
            'is_own' => $request->user()?->id === $this->user_id,
            'edited_at' => $this->edited_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
            'sender_id' => $this->user_id,
            'sender' => [
                'id' => $this->sender?->id,
                'name' => $this->sender?->name,
                'avatar' => $this->sender?->avatar,
            ],
        ];
    }
}
