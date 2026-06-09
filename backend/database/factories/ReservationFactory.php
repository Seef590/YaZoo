<?php

namespace Database\Factories;

use App\Models\Animal;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reservation>
 */
class ReservationFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<Reservation>
     */
    protected $model = Reservation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'buyer_id' => User::factory(),
            'seller_id' => User::factory(),
            'reservable_type' => Animal::class,
            'reservable_id' => Animal::factory(),
            'quantity' => 1,
            'note' => fake()->sentence(),
            'payment_method' => fake()->randomElement(Reservation::PAYMENT_METHODS),
            'reservation_status' => 'pending',
            'payment_status' => 'pending',
            'unit_price' => fake()->randomFloat(2, 0, 2500),
            'total_price' => fake()->randomFloat(2, 0, 2500),
            'approved_at' => null,
            'completed_at' => null,
            'cancelled_at' => null,
        ];
    }
}
