<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /**
     * Determine whether the user can create a product listing.
     */
    public function create(User $user): bool
    {
        return $user->exists;
    }

    /**
     * Determine whether the user can update the listing.
     */
    public function update(User $user, Product $product): bool
    {
        return $user->is($product->user);
    }

    /**
     * Determine whether the user can delete the listing.
     */
    public function delete(User $user, Product $product): bool
    {
        return $user->is($product->user);
    }

    /**
     * Determine whether the user can reserve the product.
     */
    public function reserve(User $user, Product $product): bool
    {
        return ! $user->is($product->user);
    }
}
