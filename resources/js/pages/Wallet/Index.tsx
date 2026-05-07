import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Wallet',
        href: '/wallet',
    },
];

interface Wallet {
    id: number;
    balance: string;
}

interface Transaction {
    id: number;
    type: 'deposit' | 'withdraw' | 'transfer';
    amount: string;
    status: string;
    reference_id: string | null;
    created_at: string;
}

interface PageProps {
    wallet: Wallet;
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: any;
}

export default function WalletIndex({ wallet, transactions }: PageProps) {
    const { flash } = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');

    const depositForm = useForm({ amount: '' });
    const withdrawForm = useForm({ amount: '' });
    const transferForm = useForm({ email: '', amount: '' });

    const handleDeposit: FormEventHandler = (e) => {
        e.preventDefault();
        depositForm.post(route('wallet.deposit'), {
            onSuccess: () => depositForm.reset(),
        });
    };

    const handleWithdraw: FormEventHandler = (e) => {
        e.preventDefault();
        withdrawForm.post(route('wallet.withdraw'), {
            onSuccess: () => withdrawForm.reset(),
        });
    };

    const handleTransfer: FormEventHandler = (e) => {
        e.preventDefault();
        transferForm.post(route('wallet.transfer'), {
            onSuccess: () => transferForm.reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallet" />
            
            <div className="flex flex-col gap-6 p-4 max-w-5xl mx-auto w-full">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-green-900/20 dark:text-green-400" role="alert">
                        <span className="font-medium">Success!</span> {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 dark:text-red-400" role="alert">
                        <span className="font-medium">Error!</span> {flash.error}
                    </div>
                )}

                {/* Balance Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl flex flex-col justify-between items-start md:flex-row md:items-center">
                    <div>
                        <h2 className="text-indigo-100 text-lg font-medium tracking-wide">Current Balance</h2>
                        <div className="text-5xl font-bold mt-2 tracking-tight">${Number(wallet.balance).toFixed(2)}</div>
                    </div>
                    <div className="mt-6 md:mt-0 opacity-80">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Action Panel */}
                    <div className="md:col-span-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
                        
                        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg mb-6">
                            {(['deposit', 'withdraw', 'transfer'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                        activeTab === tab 
                                            ? 'bg-white dark:bg-neutral-700 shadow text-neutral-900 dark:text-white' 
                                            : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Deposit Form */}
                        {activeTab === 'deposit' && (
                            <form onSubmit={handleDeposit} className="space-y-4">
                                <div>
                                    <Label htmlFor="deposit_amount">Amount ($)</Label>
                                    <Input
                                        id="deposit_amount"
                                        type="number"
                                        step="0.01"
                                        value={depositForm.data.amount}
                                        onChange={e => depositForm.setData('amount', e.target.value)}
                                        placeholder="0.00"
                                        className="mt-1"
                                    />
                                    {depositForm.errors.amount && <div className="text-red-500 text-sm mt-1">{depositForm.errors.amount}</div>}
                                </div>
                                <Button type="submit" disabled={depositForm.processing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                    Deposit Funds
                                </Button>
                            </form>
                        )}

                        {/* Withdraw Form */}
                        {activeTab === 'withdraw' && (
                            <form onSubmit={handleWithdraw} className="space-y-4">
                                <div>
                                    <Label htmlFor="withdraw_amount">Amount ($)</Label>
                                    <Input
                                        id="withdraw_amount"
                                        type="number"
                                        step="0.01"
                                        value={withdrawForm.data.amount}
                                        onChange={e => withdrawForm.setData('amount', e.target.value)}
                                        placeholder="0.00"
                                        className="mt-1"
                                    />
                                    {withdrawForm.errors.amount && <div className="text-red-500 text-sm mt-1">{withdrawForm.errors.amount}</div>}
                                </div>
                                <Button type="submit" disabled={withdrawForm.processing} variant="destructive" className="w-full">
                                    Withdraw Funds
                                </Button>
                            </form>
                        )}

                        {/* Transfer Form */}
                        {activeTab === 'transfer' && (
                            <form onSubmit={handleTransfer} className="space-y-4">
                                <div>
                                    <Label htmlFor="transfer_email">Recipient Email</Label>
                                    <Input
                                        id="transfer_email"
                                        type="email"
                                        value={transferForm.data.email}
                                        onChange={e => transferForm.setData('email', e.target.value)}
                                        placeholder="user@example.com"
                                        className="mt-1"
                                    />
                                    {transferForm.errors.email && <div className="text-red-500 text-sm mt-1">{transferForm.errors.email}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="transfer_amount">Amount ($)</Label>
                                    <Input
                                        id="transfer_amount"
                                        type="number"
                                        step="0.01"
                                        value={transferForm.data.amount}
                                        onChange={e => transferForm.setData('amount', e.target.value)}
                                        placeholder="0.00"
                                        className="mt-1"
                                    />
                                    {transferForm.errors.amount && <div className="text-red-500 text-sm mt-1">{transferForm.errors.amount}</div>}
                                </div>
                                <Button type="submit" disabled={transferForm.processing} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                    Send Transfer
                                </Button>
                            </form>
                        )}
                    </div>

                    {/* Transaction History */}
                    <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xl font-semibold mb-6">Recent Transactions</h3>
                        
                        {transactions.data.length === 0 ? (
                            <div className="text-center py-12 text-neutral-500">
                                No transactions found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-800/50">
                                        <tr>
                                            <th className="px-4 py-3 rounded-tl-lg">ID</th>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">Amount</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Ref ID</th>
                                            <th className="px-4 py-3 rounded-tr-lg">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.data.map((tx) => (
                                            <tr key={tx.id} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                                                <td className="px-4 py-4 text-neutral-500 font-mono text-xs">
                                                    #{tx.id}
                                                </td>
                                                <td className="px-4 py-4 font-medium">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize
                                                        ${tx.type === 'deposit' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                                                        ${tx.type === 'withdraw' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                                                        ${tx.type === 'transfer' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                                                    `}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className={`px-4 py-4 font-semibold ${tx.type === 'deposit' ? 'text-green-600 dark:text-green-400' : ''} ${(tx.type === 'withdraw' || tx.type === 'transfer') ? 'text-neutral-900 dark:text-neutral-100' : ''}`}>
                                                    {tx.type === 'deposit' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="capitalize text-neutral-600 dark:text-neutral-400">{tx.status}</span>
                                                </td>
                                                <td className="px-4 py-4 text-neutral-500 font-mono text-xs max-w-[100px] truncate" title={tx.reference_id || '-'}>
                                                    {tx.reference_id ? tx.reference_id.substring(0, 8) + '...' : '-'}
                                                </td>
                                                <td className="px-4 py-4 text-neutral-500">
                                                    {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
