<?php

namespace App\Http\Controllers\Api;

use App\DTOs\PaginationData;
use App\Events\ConversationMessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Messaging\StoreConversationRequest;
use App\Http\Resources\Messaging\ConversationResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use App\Support\PhoneNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    /**
     * Display the authenticated user's conversations.
     */
    public function index(Request $request)
    {
        $pagination = PaginationData::fromRequest($request, 20, 50);

        $conversations = Conversation::query()
            ->where(function ($query) use ($request) {
                $query
                    ->where('participant_one_id', $request->user()->id)
                    ->orWhere('participant_two_id', $request->user()->id);
            })
            ->with([
                'participantOne:id,name,email,phone,avatar,city,country',
                'participantTwo:id,name,email,phone,avatar,city,country',
                'latestMessage.sender:id,name,avatar',
            ])
            ->withCount([
                'messages as unread_messages_count' => fn ($query) => $query
                    ->where('user_id', '!=', $request->user()->id)
                    ->whereNull('read_at'),
            ])
            ->orderByDesc('updated_at')
            ->paginate($pagination->perPage);

        return ConversationResource::collection($conversations);
    }

    /**
     * Start a conversation or reuse an existing one.
     */
    public function store(StoreConversationRequest $request): JsonResponse
    {
        $recipient = $this->resolveRecipient((string) $request->validated('recipient_contact'));

        [$conversation, $statusCode] = DB::transaction(function () use ($request, $recipient): array {
            [$conversation, $wasCreated] = $this->findOrCreateConversation($request->user(), $recipient);
            $body = trim((string) $request->validated('body', ''));

            if ($body !== '') {
                $message = $conversation->messages()->create([
                    'user_id' => $request->user()->id,
                    'body' => $body,
                ]);

                $message->load('sender:id,name,avatar');
                $conversation->refresh();
                $this->notifyRecipient($conversation, $request->user()->id, $message);
                event((new ConversationMessageSent($conversation, $message))->dontBroadcastToCurrentUser());
            }

            return [$conversation, $wasCreated ? 201 : 200];
        });

        $this->loadConversationState($conversation, $request->user()->id, true);

        return ConversationResource::make($conversation)
            ->response()
            ->setStatusCode($statusCode);
    }

    /**
     * Display a specific conversation and mark incoming messages as read.
     */
    public function show(Request $request, Conversation $conversation): ConversationResource
    {
        $this->ensureParticipant($conversation, $request->user()->id);
        $this->markIncomingMessagesAsRead($conversation, $request->user()->id);
        $this->markConversationNotificationsAsRead($request->user(), $conversation->id);
        $this->loadConversationState($conversation, $request->user()->id, true);

        return ConversationResource::make($conversation);
    }

    /**
     * Find an existing conversation or create a new one for two users.
     *
     * @return array{0: Conversation, 1: bool}
     */
    protected function findOrCreateConversation(User $user, User $recipient): array
    {
        $conversation = Conversation::query()
            ->where(function ($query) use ($user, $recipient) {
                $query
                    ->where('participant_one_id', $user->id)
                    ->where('participant_two_id', $recipient->id);
            })
            ->orWhere(function ($query) use ($user, $recipient) {
                $query
                    ->where('participant_one_id', $recipient->id)
                    ->where('participant_two_id', $user->id);
            })
            ->first();

        if ($conversation) {
            return [$conversation, false];
        }

        [$participantOneId, $participantTwoId] = collect([$user->id, $recipient->id])
            ->sort()
            ->values()
            ->all();

        $conversation = Conversation::query()->create([
            'participant_one_id' => $participantOneId,
            'participant_two_id' => $participantTwoId,
        ]);

        return [$conversation, true];
    }

    /**
     * Ensure the authenticated user belongs to the conversation.
     */
    protected function ensureParticipant(Conversation $conversation, int $userId): void
    {
        abort_unless($conversation->hasParticipant($userId), 403, 'Acces non autorise a cette conversation.');
    }

    /**
     * Mark unread incoming messages as read.
     */
    protected function markIncomingMessagesAsRead(Conversation $conversation, int $userId): void
    {
        $conversation->messages()
            ->where('user_id', '!=', $userId)
            ->whereNull('read_at')
            ->update([
                'read_at' => now(),
            ]);
    }

    /**
     * Mark unread message notifications linked to the conversation as read.
     */
    protected function markConversationNotificationsAsRead(User $user, int $conversationId): void
    {
        $user->unreadNotifications()
            ->where('type', NewMessageNotification::class)
            ->where('data->conversation_id', $conversationId)
            ->update(['read_at' => now()]);
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
     * Load all relations required by the frontend.
     */
    protected function loadConversationState(
        Conversation $conversation,
        int $userId,
        bool $withMessages = false,
    ): void {
        $relations = [
            'participantOne:id,name,email,phone,avatar,city,country',
            'participantTwo:id,name,email,phone,avatar,city,country',
            'latestMessage.sender:id,name,avatar',
        ];

        if ($withMessages) {
            $relations['messages'] = fn ($query) => $query
                ->latest()
                ->limit(50)
                ->with('sender:id,name,avatar');
        }

        $conversation->load($relations)->loadCount([
            'messages as unread_messages_count' => fn ($query) => $query
                ->where('user_id', '!=', $userId)
                ->whereNull('read_at'),
        ]);

        if ($withMessages && $conversation->relationLoaded('messages')) {
            $conversation->setRelation(
                'messages',
                $conversation->messages->sortBy('created_at')->values(),
            );
        }
    }

    protected function resolveRecipient(string $contact): User
    {
        $phone = PhoneNumber::normalize($contact);

        return User::query()
            ->where('email', $contact)
            ->orWhere('phone', $phone)
            ->firstOrFail();
    }
}
