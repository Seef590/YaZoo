<?php

namespace Tests\Feature\Feed;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FeedApiTest extends TestCase
{
    use RefreshDatabase;

    protected function fakeImageUpload(string $name): UploadedFile
    {
        return UploadedFile::fake()->createWithContent(
            $name,
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2FoAAAAASUVORK5CYII='),
        );
    }

    public function test_authenticated_user_can_list_feed_posts(): void
    {
        $viewer = User::factory()->create();
        $post = Post::factory()->create([
            'content' => 'Premier post YaZoo',
            'tags' => ['chiens', 'astuces'],
        ]);
        Comment::factory()->create([
            'post_id' => $post->id,
        ]);
        $post->likes()->create([
            'user_id' => $viewer->id,
        ]);

        Sanctum::actingAs($viewer, ['*']);

        $response = $this->getJson('/api/posts');

        $response
            ->assertOk()
            ->assertJsonPath('data.0.content', 'Premier post YaZoo')
            ->assertJsonPath('data.0.likes', 1)
            ->assertJsonPath('data.0.liked', true)
            ->assertJsonPath('data.0.commentsCount', 1)
            ->assertJsonPath('data.0.tags.0', 'chiens');
    }

    public function test_authenticated_user_can_create_post(): void
    {
        Sanctum::actingAs(User::factory()->create(), ['*']);

        $response = $this->postJson('/api/posts', [
            'content' => 'Mon premier post backend.',
            'location' => 'Casablanca',
            'tags' => ['animaux', 'communaute'],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.content', 'Mon premier post backend.')
            ->assertJsonPath('data.location', 'Casablanca')
            ->assertJsonPath('data.tags.0', 'animaux');

        $this->assertDatabaseHas('posts', [
            'content' => 'Mon premier post backend.',
            'location' => 'Casablanca',
        ]);
    }

    public function test_authenticated_user_can_create_post_with_uploaded_image(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create(), ['*']);

        $response = $this->post('/api/posts', [
            'content' => 'Post avec image',
            'media_file' => $this->fakeImageUpload('feed.jpg'),
        ], [
            'Accept' => 'application/json',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.content', 'Post avec image')
            ->assertJsonPath('data.mediaKind', 'image');

        $path = Post::query()->latest()->first()?->media_path;

        $this->assertNotNull($path);
        Storage::disk('public')->assertExists($path);
    }

    public function test_authenticated_user_can_create_post_with_uploaded_video_only(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create(), ['*']);

        $response = $this->post('/api/posts', [
            'content' => '',
            'media_file' => UploadedFile::fake()->create('clip.mp4', 1024, 'video/mp4'),
        ], [
            'Accept' => 'application/json',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.mediaKind', 'video');

        $this->assertDatabaseHas('posts', [
            'media_kind' => 'video',
        ]);
    }

    public function test_authenticated_user_can_toggle_like_on_post(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create();

        Sanctum::actingAs($user, ['*']);

        $this->postJson("/api/posts/{$post->id}/like")
            ->assertOk()
            ->assertJsonPath('data.liked', true)
            ->assertJsonPath('data.likes', 1);

        $this->postJson("/api/posts/{$post->id}/like")
            ->assertOk()
            ->assertJsonPath('data.liked', false)
            ->assertJsonPath('data.likes', 0);
    }

    public function test_liking_another_users_post_creates_a_notification(): void
    {
        $owner = User::factory()->create();
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $owner->id,
        ]);

        Sanctum::actingAs($user, ['*']);

        $this->postJson("/api/posts/{$post->id}/like")
            ->assertOk();

        $this->assertSame(1, $owner->notifications()->count());
        $this->assertSame('post_like', $owner->notifications()->first()->data['kind']);
    }

    public function test_authenticated_user_can_comment_on_post(): void
    {
        $user = User::factory()->create([
            'name' => 'Comment User',
        ]);
        $post = Post::factory()->create();

        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson("/api/posts/{$post->id}/comments", [
            'body' => 'Voici un commentaire utile.',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.body', 'Voici un commentaire utile.')
            ->assertJsonPath('data.author.name', 'Comment User');

        $this->assertDatabaseHas('comments', [
            'post_id' => $post->id,
            'user_id' => $user->id,
            'body' => 'Voici un commentaire utile.',
        ]);
    }

    public function test_commenting_another_users_post_creates_a_notification(): void
    {
        $owner = User::factory()->create();
        $user = User::factory()->create([
            'name' => 'Comment User',
        ]);
        $post = Post::factory()->create([
            'user_id' => $owner->id,
        ]);

        Sanctum::actingAs($user, ['*']);

        $this->postJson("/api/posts/{$post->id}/comments", [
            'body' => 'Voici un commentaire utile.',
        ])
            ->assertCreated();

        $this->assertSame(1, $owner->notifications()->count());
        $this->assertSame('post_comment', $owner->notifications()->first()->data['kind']);
    }
}
