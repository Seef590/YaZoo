<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateContentModerationStatusRequest;
use App\Models\Animal;
use App\Models\Post;
use App\Models\Product;
use App\Models\ServiceListing;
use App\Models\Veterinarian;
use App\Services\Admin\ModerationLogger;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;

class AdminContentModerationController extends Controller
{
    /**
     * @var array<string, class-string<Model>>
     */
    private const CONTENT_MAP = [
        'animal' => Animal::class,
        'product' => Product::class,
        'service' => ServiceListing::class,
        'veterinarian' => Veterinarian::class,
        'post' => Post::class,
    ];

    public function __construct(
        private readonly ModerationLogger $logger,
    ) {}

    public function update(UpdateContentModerationStatusRequest $request, string $type, int $id): JsonResponse
    {
        $modelClass = self::CONTENT_MAP[$type] ?? null;
        abort_unless($modelClass, 422);

        $content = $modelClass::query()->findOrFail($id);
        $action = $request->validated('action');
        $note = $request->validated('moderation_note');

        if ($content instanceof Animal) {
            $content->update([
                'legal_status' => $this->animalLegalStatusFor($action),
                'moderation_note' => $note ?? $content->moderation_note,
                'moderated_by' => $request->user()->id,
                'moderated_at' => now(),
            ]);
        } else {
            $content->update([
                'moderation_status' => $this->moderationStatusFor($action),
                'moderation_note' => $note ?? $content->moderation_note,
                'moderated_by' => $request->user()->id,
                'moderated_at' => now(),
            ]);
        }

        $this->logger->log(
            $request,
            $this->moderationActionName($type, $action),
            $content,
            $note,
            ['frontend_type' => $type, 'requested_action' => $action],
        );

        return response()->json([
            'message' => __('messages.admin.content_moderation_updated'),
            'type' => $type,
            'id' => $content->getKey(),
            'moderationStatus' => $content instanceof Animal
                ? $content->legal_status
                : $content->moderation_status,
        ]);
    }

    private function moderationStatusFor(string $action): string
    {
        return match ($action) {
            'hide' => 'hidden',
            'suspend' => 'suspended',
            'restore' => 'restored',
        };
    }

    private function animalLegalStatusFor(string $action): string
    {
        return match ($action) {
            'hide', 'suspend' => 'suspended',
            'restore' => 'approved',
        };
    }

    private function moderationActionName(string $type, string $action): string
    {
        if ($type === 'animal') {
            return match ($action) {
                'suspend', 'hide' => 'suspend_animal',
                'restore' => 'restore_animal',
            };
        }

        return $action;
    }
}
