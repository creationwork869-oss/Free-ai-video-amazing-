import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Send,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { User, Wallet as WalletType, WithdrawalRequest } from '../types';
import { storage } from '../utils/storage';
import { fintechAudio } from '../utils/audio';

interface WalletViewProps {
  user: User;
  wallet: WalletType;
  withdrawals: WithdrawalRequest[];
  onOpenBankModal: () => void;
  onRefreshData: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  user,
  wallet,
  withdrawals,
  onOpenBankModal,
  onRefreshData,
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState('200');
  const [payoutMethod, setPayoutMethod] = useState<'bank_account' | 'upi'>('bank_account');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(withdrawAmount);

    if (isNaN(numAmt) || numAmt < 50) {
      setStatusMessage({ type: 'error', text: 'Minimum withdrawal amount is ₹50.' });
      return;
    }
    if (numAmt > wallet.availableBalance) {
      setStatusMessage({ type: 'error', text: 'Insufficient available cashback balance.' });
      return;
    }

    if (payoutMethod === 'bank_account' && !user.linkedBank) {
      setStatusMessage({ type: 'error', text: 'Please link and verify your bank account first.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    setTimeout(() => {
      const res = storage.requestWithdrawal(numAmt, payoutMethod);
      setIsSubmitting(false);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        fintechAudio.playPaymentSuccess();
        onRefreshData();
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    }, 600);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Cashback Wallet & Withdrawals
            </h1>
            <p className="text-xs text-slate-400">
              100% genuine cashback withdrawable via IMPS to your Bank or UPI VPA.
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-3xl bg-[#0c1428] border border-emerald-500/30 p-4 shadow-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Available to Withdraw</span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            ₹{wallet.availableBalance.toFixed(2)}
          </span>
          <span className="text-[10px] text-emerald-300/70 mt-1 block">Instant Payouts</span>
        </div>

        <div className="rounded-3xl bg-[#0c1428] border border-slate-800 p-4 shadow-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Lifetime Cashback</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            ₹{wallet.lifetimeCashback.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Total rewards earned</span>
        </div>

        <div className="rounded-3xl bg-[#0c1428] border border-slate-800 p-4 shadow-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Withdrawn</span>
          <span className="text-2xl font-black text-slate-200 font-mono mt-1 block">
            ₹{wallet.totalWithdrawn.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Transferred to Bank</span>
        </div>

        <div className="rounded-3xl bg-[#0c1428] border border-slate-800 p-4 shadow-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Verification</span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
            ₹{wallet.pendingCashback.toFixed(2)}
          </span>
          <span className="text-[10px] text-amber-300/70 mt-1 block">NPCI settlement</span>
        </div>
      </div>

      {/* Main Container: Withdrawal Request & Linked Bank Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Withdrawal Form */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-[#0b1021] border border-slate-800/80 p-5 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-emerald-400" />
              <h2 className="font-extrabold text-white text-base">
                Request Cashback Withdrawal
              </h2>
            </div>

            {statusMessage && (
              <div
                className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/60 border border-rose-500/50 text-rose-200'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              {/* Payout Destination Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Select Payout Destination
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank_account')}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                      payoutMethod === 'bank_account'
                        ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-sm'
                        : 'bg-[#060a14] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building2 className={`h-4 w-4 ${payoutMethod === 'bank_account' ? 'text-emerald-400' : ''}`} />
                    <div>
                      <span className="font-bold text-xs block">Bank Account</span>
                      <span className="text-[10px] text-slate-500">IMPS 24x7</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('upi')}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                      payoutMethod === 'upi'
                        ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-sm'
                        : 'bg-[#060a14] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Send className={`h-4 w-4 ${payoutMethod === 'upi' ? 'text-emerald-400' : ''}`} />
                    <div>
                      <span className="font-bold text-xs block">UPI VPA</span>
                      <span className="text-[10px] text-slate-500">Direct VPA</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount to withdraw */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Withdrawal Amount (Min ₹50)
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(Math.floor(wallet.availableBalance).toString())}
                    className="text-[11px] font-bold text-emerald-400 hover:underline"
                  >
                    Max (₹{Math.floor(wallet.availableBalance)})
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-3 text-lg font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="50"
                    max={wallet.availableBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="200"
                    className="w-full rounded-xl bg-[#060a14] border border-slate-700 pl-9 pr-4 py-3 text-xl font-black text-white focus:border-emerald-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-2">
                {['50', '100', '250', '500'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setWithdrawAmount(amt)}
                    className="flex-1 py-1.5 rounded-lg bg-[#060a14] border border-slate-800 text-xs font-bold text-slate-300 hover:border-slate-700"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || wallet.availableBalance < 50}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 p-3.5 text-xs font-black text-slate-950 shadow-xl shadow-emerald-500/20 hover:opacity-95 transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <span>Submit Withdrawal Request</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Linked Bank & UPI IDs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-[#0b1021] border border-slate-800/80 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm">
                Linked Payment Methods
              </h3>
              <button
                onClick={onOpenBankModal}
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Link New</span>
              </button>
            </div>

            {/* Linked Bank Card */}
            {user.linkedBank ? (
              <div className="rounded-2xl bg-gradient-to-br from-[#0c1630] to-[#080e20] border border-emerald-500/40 p-4 space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-400" />
                    <span className="font-extrabold text-white text-xs">
                      {user.linkedBank.bankName}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="h-3 w-3" />
                    Penny Drop Verified
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-300">
                  A/C: ••••••••••••{user.linkedBank.accountNumber.slice(-4)}
                </div>
                <div className="text-[11px] text-slate-400">
                  IFSC: {user.linkedBank.ifsc} • Name: {user.linkedBank.accountHolderName}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#060a14] border border-dashed border-slate-700 p-4 text-center">
                <p className="text-xs text-slate-400">No bank account linked yet.</p>
                <button
                  onClick={onOpenBankModal}
                  className="mt-2 text-xs font-bold text-emerald-400 hover:underline"
                >
                  Link Bank Account →
                </button>
              </div>
            )}

            {/* Linked UPI ID Card */}
            <div className="rounded-2xl bg-[#060a14] border border-slate-800 p-4 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  PRIMARY UPI VPA
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Active</span>
              </div>
              <span className="font-mono text-xs font-bold text-white block">
                {user.upiId || `${user.phone}@okhdfcbank`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Requests History */}
      <div>
        <h3 className="font-extrabold text-white text-base mb-3 px-1">
          Cashback Payout History
        </h3>

        <div className="rounded-3xl bg-[#0b1021] border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-lg">
          {withdrawals.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No withdrawal requests yet.
            </div>
          ) : (
            withdrawals.map((w) => (
              <div key={w.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-xs sm:text-sm">
                      Withdrawal to {w.destinationDetail}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        w.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : w.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                    {new Date(w.requestedAt).toLocaleString()} {w.referenceNumber && `• IMPS: ${w.referenceNumber}`}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-black text-white font-mono text-sm sm:text-base">
                    ₹{w.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
