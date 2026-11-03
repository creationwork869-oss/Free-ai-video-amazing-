import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionsViewProps {
  transactions: Transaction[];
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);

  const filtered = transactions.filter((tx) => {
    if (filterType === 'payments' && tx.type !== 'upi_payment') return false;
    if (filterType === 'cashback' && tx.type !== 'cashback_credit') return false;
    if (filterType === 'withdrawals' && tx.type !== 'withdrawal') return false;
    if (filterType === 'referrals' && tx.type !== 'referral_bonus') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tx.recipientName?.toLowerCase().includes(q);
      const matchUpi = tx.recipientUpi?.toLowerCase().includes(q);
      const matchRrn = tx.rrn.includes(q);
      const matchNote = tx.note?.toLowerCase().includes(q);
      return matchName || matchUpi || matchRrn || matchNote;
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-24 md:pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Transaction History & Receipts
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          NPCI verified audit log of payments, cashback credits, and bank withdrawals.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by merchant, UPI ID, or 12-digit RRN..."
            className="w-full rounded-2xl bg-[#0b1021] border border-slate-800/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'payments', label: 'Payments' },
            { id: 'cashback', label: 'Cashback' },
            { id: 'withdrawals', label: 'Withdrawals' },
            { id: 'referrals', label: 'Referrals' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition border ${
                filterType === tab.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                  : 'bg-[#0b1021] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="rounded-3xl bg-[#0b1021] border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No transactions found matching your criteria.
          </div>
        ) : (
          filtered.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setActiveReceipt(tx)}
              className="p-4 flex items-center justify-between hover:bg-[#0e162c] cursor-pointer transition"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`h-11 w-11 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 ${
                    tx.type === 'cashback_credit' || tx.type === 'referral_bonus'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : tx.type === 'withdrawal'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {tx.type === 'cashback_credit' ? '💰' : tx.type === 'withdrawal' ? '🏦' : '📤'}
                </div>

                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    {tx.recipientName || tx.note || 'UPI Transaction'}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px]">RRN: {tx.rrn}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`font-black text-sm sm:text-base font-mono block ${
                    tx.type === 'cashback_credit' || tx.type === 'referral_bonus'
                      ? 'text-emerald-400'
                      : tx.type === 'withdrawal'
                      ? 'text-amber-400'
                      : 'text-white'
                  }`}
                >
                  {tx.type === 'cashback_credit' || tx.type === 'referral_bonus' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                </span>
                {tx.cashbackEarned && (
                  <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                    +₹{tx.cashbackEarned} Cashback
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transaction Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0c1328] border border-emerald-500/40 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center pt-2">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Payment Status</span>
              <h3 className="text-xl font-black text-white capitalize mt-0.5">
                {activeReceipt.status.toUpperCase()}
              </h3>
              <div className="text-3xl font-black text-emerald-400 font-mono my-2">
                ₹{activeReceipt.amount.toFixed(2)}
              </div>
            </div>

            <div className="rounded-2xl bg-[#060a14] border border-slate-800 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-bold text-white">{activeReceipt.recipientName || 'Super Cashback'}</span>
              </div>
              {activeReceipt.recipientUpi && (
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">UPI ID:</span>
                  <span className="text-slate-200">{activeReceipt.recipientUpi}</span>
                </div>
              )}
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">NPCI RRN:</span>
                <span className="text-emerald-400">{activeReceipt.rrn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <span className="text-slate-300">{new Date(activeReceipt.createdAt).toLocaleString()}</span>
              </div>
              {activeReceipt.cashbackEarned && (
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-emerald-400">
                  <span>Cashback Earned:</span>
                  <span>+₹{activeReceipt.cashbackEarned}.00</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Verified NPCI Bank Transaction</span>
            </div>

            <button
              onClick={() => setActiveReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 transition"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
