<?php

namespace App\Http\Controllers\Api;

use App\Events\ConversationMessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Messaging\StoreMessageRequest;
use App\Http\Resources\Messaging\ConversationResource;
use App\Http\Resources\Messaging\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Notifications\NewMessageNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Store a newly created message in a conversation.
     */
    public function store(StoreMessageRequest $request, Conversation $conversation): JsonResponse
    {
        $this->ensureParticipant($conversation, $request);

        $message = $conversation->messages()->create([
            'user_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);

        $message->load('sender:id,name,avatar');
        $conversation->refresh();
        $this->notifyRecipient($conversation, $request->user()->id, $message);
        $this->loadConversationSummary($conversation, $request->user()->id);
        event((new ConversationMessageSent($conversation, $message))->dontBroadcastToCurrentUser());

        return response()->json([
            'message' => 'Message envoye.',
            'data' => MessageResource::make($message)->resolve(),
            'conversation' => ConversationResource::make($conversation)->resolve(),
        ], 201);
    }

    /**
     * Ensure the user belongs to the conversation.
     */
    protected function ensureParticipant(Conversation $conversation, Request $request): void
    {
        abort_unless(
            $conversation->hasParticipant($request->user()->id),
            403,
            'Acces non autorise a cette conversation.',
        );
    }

    /**
     * Notify the other participant about a new message.
     */
    protected function notifyRecipient(Conversation $conversation, int $senderId, Message $message): void
    {
        $conversation->loadMissing([
            'participantOne:id,name,email,phone,avatar,city,country',
            'participantTwo:id,name,email,phone,avatar,city,country',
        ]);

        $recipient = $conversation->otherParticipantFor($senderId);
        $sender = $senderId === $conversation->participant_one_id
            ? $conversation->participantOne
            : $conversation->participantTwo;

        if ($recipient && $sender && ! $recipient->is($sender)) {
            $recipient->notify(new NewMessageNotification($conversation, $message, $sender));
        }
    }

    /**
     * Load the summary data required by the conversations list.
     */
    protected function loadConversationSummary(Conversation $conversation, int $userId): void
    {
        $conversation->load([
            'participantOne:id,name,email,phone,avatar,city,country',
            'participantTwo:id,name,email,phone,avatar,city,country',
            'latestMessage.sender:id,name,avatar',
        ])->loadCount([
            'messages as unread_messages_count' => fn ($query) => $query
                ->where('user_id', '!=', $userId)
                ->whereNull('read_at'),
        ]);
    }
}
