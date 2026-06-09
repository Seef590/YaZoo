<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_root_returns_json_health_payload(): void
    {
        $this->getJson('/api')
            ->assertOk()
            ->assertJsonPath('status', 'ok');
    }

    public function test_user_can_register_and_receive_secure_cookie_only_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'YaZoo Tester',
            'email' => 'tester@yazoo.app',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '+212600000000',
            'country' => 'Maroc',
            'city' => 'Casablanca',
            'device_name' => 'phpunit',
        ]);

        $response
            ->assertCreated()
            ->assertCookie('yazoo_api_token')
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'phone', 'country', 'city', 'isAdmin'],
            ]);

        $this->assertArrayNotHasKey('token', $response->json());
        $this->assertDatabaseHas('users', [
            'email' => 'tester@yazoo.app',
            'city' => 'Casablanca',
            'is_admin' => true,
        ]);
        $response->assertJsonPath('user.isAdmin', true);
    }

    public function test_user_can_login_me_and_logout_with_bearer_token_from_secure_cookie(): void
    {
        $user = User::factory()->admin()->create([
            'name' => 'Existing User',
            'email' => 'existing@yazoo.app',
            'password' => 'password123',
        ]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'existing@yazoo.app',
            'password' => 'password123',
            'device_name' => 'phpunit',
        ]);

        $token = $this->plainTokenFromCookie($loginResponse);

        $loginResponse
            ->assertOk()
            ->assertCookie('yazoo_api_token')
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonPath('user.isAdmin', true);

        $this->assertArrayNotHasKey('token', $loginResponse->json());

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonPath('user.isAdmin', true);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Deconnexion reussie.');

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_legacy_login_route_uses_cookie_only_auth_response(): void
    {
        $user = User::factory()->create([
            'email' => 'legacy-login@yazoo.app',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'legacy-login@yazoo.app',
            'password' => 'password123',
            'device_name' => 'legacy-api-client',
        ]);

        $response
            ->assertOk()
            ->assertCookie('yazoo_api_token')
            ->assertJsonPath('user.email', $user->email);

        $this->assertArrayNotHasKey('token', $response->json());
    }

    public function test_user_can_authenticate_with_the_http_only_cookie_flow(): void
    {
        $user = User::factory()->create([
            'email' => 'cookie@yazoo.app',
            'password' => 'password123',
        ]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'cookie@yazoo.app',
            'password' => 'password123',
            'device_name' => 'frontend',
        ]);

        $encryptedToken = $this->authCookieValue($loginResponse);

        $loginResponse
            ->assertOk()
            ->assertCookie('yazoo_api_token');

        $this->withCredentials()
            ->withUnencryptedCookie('yazoo_api_token', $encryptedToken)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.email', $user->email);

        $this->withCredentials()
            ->withUnencryptedCookie('yazoo_api_token', $encryptedToken)
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Deconnexion reussie.');
    }

    public function test_request_otp_never_exposes_debug_code(): void
    {
        User::factory()->create([
            'phone' => '+212600000010',
        ]);

        $response = $this->postJson('/api/auth/otp/request', [
            'phone' => '+212600000010',
            'intent' => 'login',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure(['message', 'expires_at']);

        $this->assertArrayNotHasKey('otp_debug_code', $response->json());
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'wrong@yazoo.app',
            'password' => 'password123',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'wrong@yazoo.app',
            'password' => 'bad-password',
            'device_name' => 'phpunit',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_unauthenticated_plain_api_request_returns_json_instead_of_a_server_error(): void
    {
        $this->get('/api/auth/me')
            ->assertUnauthorized()
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_only_the_first_registered_user_becomes_admin_by_default(): void
    {
        $firstResponse = $this->postJson('/api/auth/register', [
            'name' => 'Premier Admin',
            'email' => 'admin@yazoo.app',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'device_name' => 'phpunit',
        ]);

        $secondResponse = $this->postJson('/api/auth/register', [
            'name' => 'Second User',
            'email' => 'user@yazoo.app',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'device_name' => 'phpunit',
        ]);

        $firstResponse
            ->assertCreated()
            ->assertJsonPath('user.isAdmin', true);

        $secondResponse
            ->assertCreated()
            ->assertJsonPath('user.isAdmin', false);
    }

    private function plainTokenFromCookie(TestResponse $response): string
    {
        return Crypt::decryptString(rawurldecode($this->authCookieValue($response)));
    }

    private function authCookieValue(TestResponse $response): string
    {
        foreach ($response->headers->getCookies() as $cookie) {
            if ($cookie->getName() === 'yazoo_api_token') {
                return $cookie->getValue();
            }
        }

        $this->fail('Missing yazoo_api_token cookie.');
    }
}
