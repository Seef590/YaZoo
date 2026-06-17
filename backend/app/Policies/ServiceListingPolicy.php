<?php

namespace App\Policies;

use App\Models\ServiceListing;
use App\Models\User;

class ServiceListingPolicy
{
    public function create(User $user): bool
    {
        return $user->exists;
    }

    public function update(User $user, ServiceListing $service): bool
    {
        return $user->is($service->user) || (bool) $user->is_admin;
    }

    public function delete(User $user, ServiceListing $service): bool
    {
        return $user->is($service->user) || (bool) $user->is_admin;
    }

    public function reserve(User $user, ServiceListing $service): bool
    {
        return ! $user->is($service->user);
    }
}
