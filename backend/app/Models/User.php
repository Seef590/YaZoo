<?php

namespace App\Models;

use App\Support\PhoneNumber;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'country',
        'city',
        'bio',
        'avatar',
        'cover_photo',
        'google_id',
        'google_avatar',
        'is_admin',
        'password',
        'phone_verified_at',
        'preferred_locale',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'is_admin' => 'boolean',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the posts created by the user.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Get the stories created by the user.
     */
    public function stories(): HasMany
    {
        return $this->hasMany(Story::class);
    }

    /**
     * Get the comments created by the user.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get the likes created by the user.
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    /**
     * Get the users following this user.
     */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(
            self::class,
            'follows',
            'followed_user_id',
            'follower_user_id',
        )->withTimestamps();
    }

    /**
     * Get the users followed by this user.
     */
    public function following(): BelongsToMany
    {
        return $this->belongsToMany(
            self::class,
            'follows',
            'follower_user_id',
            'followed_user_id',
        )->withTimestamps();
    }

    /**
     * Get the animal listings created by the user.
     */
    public function animals(): HasMany
    {
        return $this->hasMany(Animal::class);
    }

    /**
     * Get the product listings created by the user.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get the service listings created by the user.
     */
    public function serviceListings(): HasMany
    {
        return $this->hasMany(ServiceListing::class);
    }

    /**
     * Get the communities created by the user.
     */
    public function createdCommunities(): HasMany
    {
        return $this->hasMany(Community::class);
    }

    /**
     * Get the memberships of the user in communities.
     */
    public function communityMemberships(): HasMany
    {
        return $this->hasMany(CommunityMember::class);
    }

    /**
     * Get the messages sent by the user.
     */
    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get the story views created by the user.
     */
    public function storyViews(): HasMany
    {
        return $this->hasMany(StoryView::class);
    }

    /**
     * Get the reservations created by the user as buyer.
     */
    public function reservationsAsBuyer(): HasMany
    {
        return $this->hasMany(Reservation::class, 'buyer_id');
    }

    /**
     * Get the reservations received by the user as seller.
     */
    public function reservationsAsSeller(): HasMany
    {
        return $this->hasMany(Reservation::class, 'seller_id');
    }

    /**
     * Get activity log rows owned by the user.
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Get the reviews written by the user.
     */
    public function reviewsWritten(): HasMany
    {
        return $this->hasMany(ReservationReview::class, 'reviewer_id');
    }

    /**
     * Get the reviews received by the user.
     */
    public function reviewsReceived(): HasMany
    {
        return $this->hasMany(ReservationReview::class, 'reviewee_id');
    }

    /**
     * Determine whether the user has a real email address.
     */
    public function hasRealEmail(): bool
    {
        return ! PhoneNumber::isPlaceholderEmail($this->email);
    }

    /**
     * Get the email that can be shown to users.
     */
    public function publicEmail(): ?string
    {
        return $this->hasRealEmail() ? $this->email : null;
    }

    /**
     * Determine whether the user's phone number is verified.
     */
    public function hasVerifiedPhone(): bool
    {
        return $this->phone_verified_at !== null;
    }
}
