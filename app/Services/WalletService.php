<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Wallet;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WalletService
{
    /**
     * Deposit amount into wallet.
     *
     * @throws Exception
     */
    public function deposit(Wallet $wallet, float $amount): Transaction
    {
        if ($amount <= 0) {
            throw new Exception('Deposit amount must be greater than zero.');
        }

        return DB::transaction(function () use ($wallet, $amount) {
            $wallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();

            $wallet->balance += $amount;
            $wallet->save();

            return $wallet->transactions()->create([
                'type' => 'deposit',
                'amount' => $amount,
                'status' => 'completed',
            ]);
        });
    }

    /**
     * Withdraw amount from wallet.
     *
     * @throws Exception
     */
    public function withdraw(Wallet $wallet, float $amount): Transaction
    {
        if ($amount <= 0) {
            throw new Exception('Withdrawal amount must be greater than zero.');
        }

        return DB::transaction(function () use ($wallet, $amount) {
            $wallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();

            if ($wallet->balance < $amount) {
                throw new Exception('Insufficient balance.');
            }

            $wallet->balance -= $amount;
            $wallet->save();

            return $wallet->transactions()->create([
                'type' => 'withdraw',
                'amount' => $amount,
                'status' => 'completed',
            ]);
        });
    }

    /**
     * Transfer amount from one wallet to another.
     *
     * @return array<string, Transaction>
     *
     * @throws Exception
     */
    public function transfer(Wallet $senderWallet, Wallet $receiverWallet, float $amount): array
    {
        if ($amount <= 0) {
            throw new Exception('Transfer amount must be greater than zero.');
        }

        if ($senderWallet->id === $receiverWallet->id) {
            throw new Exception('Cannot transfer to the same wallet.');
        }

        return DB::transaction(function () use ($senderWallet, $receiverWallet, $amount) {
            // Lock both wallets. To avoid deadlocks, order by ID.
            $wallets = Wallet::whereIn('id', [$senderWallet->id, $receiverWallet->id])
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $lockedSender = $wallets->get($senderWallet->id);
            $lockedReceiver = $wallets->get($receiverWallet->id);

            if (! $lockedSender || ! $lockedReceiver) {
                throw new Exception('One or both wallets not found.');
            }

            if ($lockedSender->balance < $amount) {
                throw new Exception('Insufficient balance for transfer.');
            }

            $lockedSender->balance -= $amount;
            $lockedSender->save();

            $lockedReceiver->balance += $amount;
            $lockedReceiver->save();

            $referenceId = Str::uuid()->toString();

            $withdrawTx = $lockedSender->transactions()->create([
                'type' => 'transfer',
                'amount' => $amount,
                'status' => 'completed',
                'reference_id' => $referenceId,
            ]);

            $depositTx = $lockedReceiver->transactions()->create([
                'type' => 'transfer',
                'amount' => $amount,
                'status' => 'completed',
                'reference_id' => $referenceId,
            ]);

            return [
                'sender_transaction' => $withdrawTx,
                'receiver_transaction' => $depositTx,
            ];
        });
    }
}
