<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_persists_user_with_hashed_password(): void
    {
        $service = app(UserService::class);

        $user = $service->create([
            'name' => 'Admin Created',
            'email' => 'admin-created@example.test',
            'password' => 'secret123',
            'preferred_locale' => 'fr',
        ]);

        $this->assertInstanceOf(User::class, $user);
        $this->assertTrue(Hash::check('secret123', $user->password));
    }

    public function test_paginate_returns_users(): void
    {
        User::factory()->count(3)->create();

        $page = app(UserService::class)->paginate(2);

        $this->assertSame(2, $page->perPage());
        $this->assertSame(3, $page->total());
    }
}
