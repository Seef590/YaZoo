<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Feed\StoreCommentRequest;
use App\Http\Resources\Feed\CommentResource;
use App\Models\Post;
use App\Notifications\PostCommentedNotification;
use Illuminate\Http\JsonResponse;

class CommentController extends Controller
{
    /**
     * Store a newly created comment on a post.
     */
    public function store(StoreCommentRequest $request, Post $post): JsonResponse
    {
        $this->authorize('comment', $post);

        $comment = $post->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);

        $post->loadMissing('user');

        if ($post->user && ! $request->user()->is($post->user)) {
            $post->user->notify(
                new PostCommentedNotification($post, $comment, $request->user()),
            );
        }

        $comment->load('user:id,name,avatar,city,country');

        return CommentResource::make($comment)
            ->response()
            ->setStatusCode(201);
    }
}
