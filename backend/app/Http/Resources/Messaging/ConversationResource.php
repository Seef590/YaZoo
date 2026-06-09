<?php

namespace App\Http\Resources\Messaging;

use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Conversation
 */
class ConversationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $participant = $this->otherParticipantFor($request->user()?->id ?? 0);

        return [
            'id' => $this->id,
            'participant' => [
                'id' => $participant?->id,
                'name' => $participant?->name,
                'email' => $participant?->publicEmail(),
                'phone' => $participant?->phone,
                'isPhoneVerified' => $participant?->hasVerifiedPhone() ?? false,
                'avatar' => $participant?->avatar,
                'city' => $participant?->city,
                'country' => $participant?->country,
            ],
            'latestMessage' => $this->whenLoaded('latestMessage', function (): ?array {
                return $this->latestMessage
                    ? MessageResource::make($this->latestMessage)->resolve()
                    : null;
            }),
            'messages' => MessageResource::collection($this->whenLoaded('messages')),
            'unreadCount' => $this->unread_messages_count ?? 0,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
