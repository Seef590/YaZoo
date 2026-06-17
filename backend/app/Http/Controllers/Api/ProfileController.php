<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\Profile\UserProfileResource;
use App\Models\User;
use App\Support\MediaStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ProfileController extends Controller
{
    /**
     * Display the given user's public profile.
     */
    public function show(User $user): UserProfileResource
    {
        $this->loadProfileAggregates($user);

        return UserProfileResource::make($user);
    }

    /**
     * Update the given user's profile.
     */
    public function update(UpdateProfileRequest $request, User $user): UserProfileResource
    {
        $validated = $request->validated();
        $updates = collect($validated)
            ->except([
                'avatar_file',
                'cover_photo_file',
                'remove_avatar',
                'remove_cover_photo',
            ])
            ->all();

        if ($request->boolean('remove_avatar') && ! $request->hasFile('avatar_file')) {
            MediaStorage::deleteStoredFiles([$user->avatar]);
            $updates['avatar'] = null;
        }

        if ($request->boolean('remove_cover_photo') && ! $request->hasFile('cover_photo_file')) {
            MediaStorage::deleteStoredFiles([$user->cover_photo]);
            $updates['cover_photo'] = null;
        }

        if ($request->hasFile('avatar_file')) {
            $avatarPath = MediaStorage::storeUploadedFile(
                $request->file('avatar_file'),
                'profiles/avatars',
            );
            MediaStorage::deleteStoredFiles([$user->avatar]);
            $updates['avatar'] = $avatarPath;
        }

        if ($request->hasFile('cover_photo_file')) {
            $coverPath = MediaStorage::storeUploadedFile(
                $request->file('cover_photo_file'),
                'profiles/covers',
            );
            MediaStorage::deleteStoredFiles([$user->cover_photo]);
            $updates['cover_photo'] = $coverPath;
        }

        $user->update($updates);
        $this->loadProfileAggregates($user);

        return UserProfileResource::make($user);
    }

    public function follow(Request $request, User $user): JsonResponse
    {
        abort_if($request->user()->is($user), 422, 'Vous ne pouvez pas suivre votre propre profil.');

        $request->user()->following()->syncWithoutDetaching([$user->id]);
        $this->loadProfileAggregates($user);

        return response()->json([
            'message' => 'Profil suivi avec succes.',
            'data' => UserProfileResource::make($user)->resolve($request),
        ]);
    }

    public function unfollow(Request $request, User $user): JsonResponse
    {
        abort_if($request->user()->is($user), 422, 'Vous ne pouvez pas vous desabonner de votre propre profil.');

        $request->user()->following()->detach($user->id);
        $this->loadProfileAggregates($user);

        return response()->json([
            'message' => 'Abonnement retire avec succes.',
            'data' => UserProfileResource::make($user)->resolve($request),
        ]);
    }

    private function loadProfileAggregates(User $user): void
    {
        $relations = ['posts', 'animals', 'products', 'followers', 'following'];

        if (Schema::hasTable('reservation_reviews')) {
            $relations[] = 'reviewsReceived';
        }

        $user->loadCount($relations);

        if (Schema::hasTable('reservation_reviews')) {
            $user->loadAvg('reviewsReceived', 'rating');
        }
    }
}
