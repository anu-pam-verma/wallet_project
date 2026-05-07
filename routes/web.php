<?php

use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('wallet', [WalletController::class, 'index'])->name('wallet.index');
    Route::post('wallet/deposit', [WalletController::class, 'deposit'])->name('wallet.deposit');
    Route::post('wallet/withdraw', [WalletController::class, 'withdraw'])->name('wallet.withdraw');
    Route::post('wallet/transfer', [WalletController::class, 'transfer'])->name('wallet.transfer');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
