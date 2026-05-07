<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_deposit_funds(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/wallet/deposit', [
            'amount' => 100.50,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('wallets', [
            'user_id' => $user->id,
            'balance' => 100.50,
        ]);
        $this->assertDatabaseHas('transactions', [
            'type' => 'deposit',
            'amount' => 100.50,
        ]);
    }

    public function test_user_can_withdraw_funds(): void
    {
        $user = User::factory()->create();
        $wallet = $user->wallet()->create(['balance' => 200.00]);

        $response = $this->actingAs($user)->post('/wallet/withdraw', [
            'amount' => 50.00,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('wallets', [
            'user_id' => $user->id,
            'balance' => 150.00,
        ]);
        $this->assertDatabaseHas('transactions', [
            'type' => 'withdraw',
            'amount' => 50.00,
            'wallet_id' => $wallet->id,
        ]);
    }

    public function test_user_cannot_withdraw_more_than_balance(): void
    {
        $user = User::factory()->create();
        $user->wallet()->create(['balance' => 50.00]);

        $response = $this->actingAs($user)->post('/wallet/withdraw', [
            'amount' => 100.00,
        ]);

        $response->assertSessionHasErrors(['amount' => 'Insufficient balance.']);
    }

    public function test_user_can_transfer_funds(): void
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        $sender->wallet()->create(['balance' => 300.00]);
        $receiver->wallet()->create(['balance' => 50.00]);

        $response = $this->actingAs($sender)->post('/wallet/transfer', [
            'email' => $receiver->email,
            'amount' => 100.00,
        ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('wallets', [
            'user_id' => $sender->id,
            'balance' => 200.00,
        ]);

        $this->assertDatabaseHas('wallets', [
            'user_id' => $receiver->id,
            'balance' => 150.00,
        ]);

        $this->assertDatabaseHas('transactions', [
            'type' => 'transfer',
            'amount' => 100.00,
        ]);
    }
}
