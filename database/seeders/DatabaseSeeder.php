<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $wallet = \App\Models\Wallet::factory()->create([
            'user_id' => $user->id,
            'balance' => 1250.75,
        ]);

        \App\Models\Transaction::factory(5)->create([
            'wallet_id' => $wallet->id,
            'type' => 'deposit',
            'status' => 'completed',
        ]);

        \App\Models\Transaction::factory(3)->create([
            'wallet_id' => $wallet->id,
            'type' => 'withdraw',
            'status' => 'completed',
        ]);
    }
}
