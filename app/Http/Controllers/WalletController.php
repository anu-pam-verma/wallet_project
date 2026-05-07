<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Wallet;
use App\Services\WalletService;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WalletController extends Controller
{
    public function __construct(protected WalletService $walletService) {}

    public function index(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        // Ensure user has a wallet
        $wallet = $user->wallet()->firstOrCreate([], ['balance' => 0]);

        $transactions = $wallet->transactions()
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Wallet/Index', [
            'wallet' => $wallet,
            'transactions' => $transactions,
        ]);
    }

    public function deposit(Request $request)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $wallet = $user->wallet()->firstOrCreate([], ['balance' => 0]);

        try {
            $this->walletService->deposit($wallet, $validated['amount']);

            return back()->with('success', 'Deposit successful.');
        } catch (Exception $e) {
            return back()->withErrors(['amount' => $e->getMessage()]);
        }
    }

    public function withdraw(Request $request)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $wallet = $user->wallet()->firstOrCreate([], ['balance' => 0]);

        try {
            $this->walletService->withdraw($wallet, $validated['amount']);

            return back()->with('success', 'Withdrawal successful.');
        } catch (Exception $e) {
            return back()->withErrors(['amount' => $e->getMessage()]);
        }
    }

    public function transfer(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        /** @var User $sender */
        $sender = $request->user();

        if ($sender->email === $validated['email']) {
            return back()->withErrors(['email' => 'You cannot transfer to yourself.']);
        }

        $receiver = User::where('email', $validated['email'])->firstOrFail();

        $senderWallet = $sender->wallet()->firstOrCreate([], ['balance' => 0]);
        $receiverWallet = $receiver->wallet()->firstOrCreate([], ['balance' => 0]);

        try {
            $this->walletService->transfer($senderWallet, $receiverWallet, $validated['amount']);

            return back()->with('success', 'Transfer successful.');
        } catch (Exception $e) {
            return back()->withErrors(['amount' => $e->getMessage()]);
        }
    }
}
