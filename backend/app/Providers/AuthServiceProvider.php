<?php

namespace App\Providers;

use App\Models\Animal;
use App\Models\Community;
use App\Models\Post;
use App\Models\Product;
use App\Models\Reservation;
use App\Models\ServiceListing;
use App\Models\Story;
use App\Policies\AnimalPolicy;
use App\Policies\CommunityPolicy;
use App\Policies\PostPolicy;
use App\Policies\ProductPolicy;
use App\Policies\ReservationPolicy;
use App\Policies\ServiceListingPolicy;
use App\Policies\StoryPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Animal::class => AnimalPolicy::class,
        Product::class => ProductPolicy::class,
        Reservation::class => ReservationPolicy::class,
        ServiceListing::class => ServiceListingPolicy::class,
        Post::class => PostPolicy::class,
        Community::class => CommunityPolicy::class,
        Story::class => StoryPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
