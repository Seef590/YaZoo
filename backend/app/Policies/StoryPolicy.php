<?php

namespace App\Policies;

use App\Models\Story;
use App\Models\User;

class StoryPolicy
{
    /**
     * Determine whether the user can create a story.
     */
    public function create(User $user): bool
    {
        return $user->exists;
    }

    /**
     * Determine whether the user can view a story.
     */
    public function view(User $user, Story $story): bool
    {
        return $user->exists && $story->exists && $story->expires_at?->isFuture();
    }

    /**
     * Determine whether the user can delete a story.
     */
    public function delete(User $user, Story $story): bool
    {
        return $user->is($story->user) || (bool) $user->is_admin;
    }
}
