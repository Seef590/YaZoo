<?php

namespace Database\Factories;

use App\Models\Animal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Animal>
 */
class AnimalFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<Animal>
     */
    protected $model = Animal::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->firstName(),
            'category' => fake()->randomElement(Animal::CATEGORIES),
            'type' => fake()->randomElement(['chien', 'chat', 'oiseau']),
            'breed' => fake()->word(),
            'age' => fake()->numberBetween(1, 12),
            'sex' => fake()->randomElement(['male', 'female', 'unknown']),
            'location' => fake()->city(),
            'contact_phone' => fake()->phoneNumber(),
            'photo_url' => fake()->imageUrl(640, 480, 'animals'),
            'gallery_urls' => [
                fake()->imageUrl(640, 480, 'animals'),
                fake()->imageUrl(640, 480, 'animals'),
            ],
            'price' => fake()->randomFloat(2, 0, 2000),
            'is_for_adoption' => fake()->boolean(),
            'listing_status' => fake()->randomElement(Animal::LISTING_STATUSES),
            'description' => fake()->paragraph(2),
            'accepts_animal_rules' => true,
            'seller_type' => 'individual',
            'origin' => fake()->city(),
            'identification_number' => null,
            'health_certificate_path' => null,
            'vaccination_book_path' => null,
            'onssa_authorization_number' => null,
            'legal_status' => 'approved',
            'moderation_note' => null,
        ];
    }
}
