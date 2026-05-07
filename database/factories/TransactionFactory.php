<?php

namespace Database\Factories;

use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'wallet_id' => \App\Models\Wallet::factory(),
            'type' => fake()->randomElement(['deposit', 'withdraw', 'transfer']),
            'amount' => fake()->randomFloat(2, 10, 500),
            'status' => fake()->randomElement(['pending', 'completed', 'failed']),
            'reference_id' => fake()->optional()->uuid(),
        ];
    }
}
