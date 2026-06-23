<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Veterinarian;

class VeterinarianPolicy
{
    public function create(User $user): bool
    {
        return $user->exists;
    }

    public function update(User $user, Veterinarian $veterinarian): bool
    {
        return $user->is($veterinarian->user) || (bool) $user->is_admin;
    }

    public function delete(User $user, Veterinarian $veterinarian): bool
    {
        return $user->is($veterinarian->user) || (bool) $user->is_admin;
    }
}
