<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Services\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Testing\TestResponse;
use Laravel\Socialite\Contracts\User as SocialiteUser;
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
            'is_admin' => false,
        ]);
        $response->assertJsonPath('user.isAdmin', false);
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

    public function test_public_registration_does_not_create_admin_when_bootstrap_disabled(): void
    {
        $firstResponse = $this->postJson('/api/auth/register', [
            'name' => 'Premier Utilisateur',
            'email' => 'first@yazoo.app',
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
            ->assertJsonPath('user.isAdmin', false);

        $secondResponse
            ->assertCreated()
            ->assertJsonPath('user.isAdmin', false);
    }

    public function test_admin_bootstrap_only_works_when_explicitly_enabled_outside_production(): void
    {
        config(['auth.admin_bootstrap.enabled' => true]);

        $firstResponse = $this->postJson('/api/auth/register', [
            'name' => 'Bootstrap Admin',
            'email' => 'bootstrap-admin@yazoo.app',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'device_name' => 'phpunit',
        ]);

        $secondResponse = $this->postJson('/api/auth/register', [
            'name' => 'Regular User',
            'email' => 'regular-user@yazoo.app',
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

    public function test_admin_bootstrap_is_blocked_in_production_even_when_enabled(): void
    {
        config(['auth.admin_bootstrap.enabled' => true]);
        $this->app->detectEnvironment(fn () => 'production');

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Production User',
            'email' => 'production-user@yazoo.app',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'device_name' => 'phpunit',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.isAdmin', false);
    }

    public function test_google_oauth_never_creates_admin_automatically_in_production(): void
    {
        config(['auth.admin_bootstrap.enabled' => true]);
        $this->app->detectEnvironment(fn () => 'production');

        $result = app(AuthService::class)->loginWithGoogle($this->googleUser(
            'google-123',
            'google-user@yazoo.app',
            'Google User',
        ));

        $this->assertFalse($result->user->is_admin);
        $this->assertDatabaseHas('users', [
            'email' => 'google-user@yazoo.app',
            'is_admin' => false,
        ]);
    }

    public function test_create_admin_command_can_create_an_admin(): void
    {
        $this->artisan('yazoo:create-admin', [
            '--name' => 'Commission Admin',
            '--email' => 'commission-admin@example.com',
            '--password' => 'Password123',
        ])
            ->expectsConfirmation('Creer un administrateur pour commission-admin@example.com ?', 'yes')
            ->assertExitCode(0);

        $this->assertDatabaseHas('users', [
            'email' => 'commission-admin@example.com',
            'is_admin' => true,
        ]);
    }

    public function test_create_admin_command_can_promote_existing_user(): void
    {
        User::factory()->create([
            'email' => 'promote-me@example.com',
            'is_admin' => false,
        ]);

        $this->artisan('yazoo:create-admin', [
            '--email' => 'promote-me@example.com',
            '--promote' => true,
        ])
            ->expectsConfirmation('Promouvoir promote-me@example.com en administrateur ?', 'yes')
            ->assertExitCode(0);

        $this->assertDatabaseHas('users', [
            'email' => 'promote-me@example.com',
            'is_admin' => true,
        ]);
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

    private function googleUser(string $id, string $email, string $name): SocialiteUser
    {
        return new class($id, $email, $name) implements SocialiteUser
        {
            public function __construct(
                private string $id,
                private string $email,
                private string $name,
            ) {}

            public function getId()
            {
                return $this->id;
            }

            public function getNickname()
            {
                return null;
            }

            public function getName()
            {
                return $this->name;
            }

            public function getEmail()
            {
                return $this->email;
            }

            public function getAvatar()
            {
                return null;
            }
        };
    }
}
