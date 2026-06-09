<?php

namespace App\Notifications;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class NewMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        protected Conversation $conversation,
        protected Message $message,
        protected User $sender,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'kind' => 'new_message',
            'title' => 'Nouveau message prive',
            'body' => $this->sender->name.' vous a ecrit: '.Str::limit($this->message->body, 100),
            'action_url' => '/messages?conversation='.$this->conversation->id,
            'meta' => [
                'conversation_id' => $this->conversation->id,
                'message_id' => $this->message->id,
                'sender_id' => $this->sender->id,
                'sender_name' => $this->sender->name,
            ],
        ];
    }
}
