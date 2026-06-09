<?php

namespace App\Policies;

use App\Models\Animal;
use App\Models\User;

class AnimalPolicy
{
    /**
     * Determine whether the user can create a listing.
     */
    public function create(User $user): bool
    {
        return $user->exists;
    }

    /**
     * Determine whether the user can update the listing.
     */
    public function update(User $user, Animal $animal): bool
    {
        return $user->is($animal->user);
    }

    /**
     * Determine whether the user can delete the listing.
     */
    public function delete(User $user, Animal $animal): bool
    {
        return $user->is($animal->user);
    }

    /**
     * Determine whether the user can reserve the listing.
     */
    public function reserve(User $user, Animal $animal): bool
    {
        return ! $user->is($animal->user);
    }
}
