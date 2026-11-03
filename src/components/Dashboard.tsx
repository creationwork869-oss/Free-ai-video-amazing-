import React from 'react';
import {
  Wallet,
  QrCode,
  Send,
  Building2,
  Smartphone,
  Gift,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Flame,
  Share2,
} from 'lucide-react';
import { User, Wallet as WalletType, CashbackOffer, Transaction, ScratchCard } from '../types';
import { MainTabId } from './BottomNav';

interface DashboardProps {
  user: User;
  wallet: WalletType;
  offers: CashbackOffer[];
  recentTransactions: Transaction[];
  scratchCards: ScratchCard[];
  canSpinToday: boolean;
  onNavigate: (tab: MainTabId) => void;
  onOpenPayModal: (defaultRecipient?: string, defaultNote?: string) => void;
  onOpenWithdrawModal: () => void;
  onOpenBankModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  wallet,
  offers,
  recentTransactions,
  scratchCards,
  canSpinToday,
  onNavigate,
  onOpenPayModal,
  onOpenWithdrawModal,
  onOpenBankModal,
}) => {
  const unscratchedCards = scratchCards.filter((c) => !c.isScratched);

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-5xl mx-auto">
      {/* Top Welcome & KYC verified badge */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Hi, {user.name.split(' ')[0]} 👋
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              Verified UPI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            UPI ID: {user.upiId || `${user.phone}@okhdfcbank`}
          </p>
        </div>

        <button
          onClick={() => onNavigate('rewards')}
          className="relative flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition shadow-sm"
        >
          <Gift className="h-4 w-4 text-amber-400" />
          <span>Rewards</span>
          {unscratchedCards.length > 0 && (
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>
      </div>

      {/* Hero Wallet Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1a36] via-[#091326] to-[#040814] border border-emerald-500/30 p-6 md:p-8 shadow-2xl">
        {/* Glow background accent */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <span>TOTAL CASHBACK AVAILABLE</span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                ₹{wallet.availableBalance.toFixed(2)}
              </span>
              <span className="text-xs text-emerald-400 font-bold">INR</span>
            </div>

            {/* Micro stats */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Lifetime Earned</span>
                <span className="font-bold text-emerald-400 font-mono">₹{wallet.lifetimeCashback.toFixed(2)}</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-800" />
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Total Withdrawn</span>
                <span className="font-bold text-white font-mono">₹{wallet.totalWithdrawn.toFixed(2)}</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-800" />
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Pending Cashback</span>
                <span className="font-bold text-amber-400 font-mono">₹{wallet.pendingCashback.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Wallet Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onOpenWithdrawModal}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-500 px-6 py-3.5 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/25 hover:opacity-95 transition"
            >
              <ArrowUpRight className="h-4 w-4 stroke-[3]" />
              <span>Withdraw to Bank</span>
            </button>

            <button
              onClick={onOpenBankModal}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0e172e] border border-slate-700/80 px-4 py-3.5 text-xs font-bold text-slate-200 hover:text-white hover:border-emerald-400 transition"
            >
              <Building2 className="h-4 w-4 text-emerald-400" />
              <span>{user.linkedBank ? 'Manage Bank' : 'Link Bank A/C'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Payment Grid */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            title: 'Scan QR',
            desc: 'Merchant UPI',
            icon: QrCode,
            color: 'from-emerald-500 to-teal-500',
            action: () => onOpenPayModal('', 'Scan & Pay'),
            highlight: true,
          },
          {
            title: 'Pay UPI ID',
            desc: 'Instant VPA',
            icon: Send,
            color: 'from-blue-600 to-indigo-600',
            action: () => onOpenPayModal('merchant@okhdfcbank', 'Payment to UPI VPA'),
          },
          {
            title: 'Pay Mobile',
            desc: 'Contacts',
            icon: Smartphone,
            color: 'from-purple-600 to-pink-600',
            action: () => onOpenPayModal('9876543210@paytm', 'Mobile UPI Pay'),
          },
          {
            title: 'Bank Transfer',
            desc: 'Self Account',
            icon: Building2,
            color: 'from-amber-500 to-orange-500',
            action: () => onOpenBankModal(),
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              className="group flex flex-col items-center justify-center p-3 sm:p-4 rounded-3xl bg-[#0b1021] border border-slate-800/80 hover:border-emerald-500/50 hover:bg-[#0e152c] transition shadow-lg text-center"
            >
              <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-md mb-2 group-hover:scale-105 transition`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <span className="font-extrabold text-white text-xs sm:text-sm">
                {item.title}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Unscratched Scratch Card Alert Banner */}
      {unscratchedCards.length > 0 && (
        <div
          onClick={() => onNavigate('rewards')}
          className="cursor-pointer relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-black/30 backdrop-blur-md flex items-center justify-center text-amber-200 text-2xl shadow-inner shrink-0">
              🎁
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 text-amber-200">
                LUCKY REWARD UNLOCKED
              </span>
              <h3 className="font-black text-white text-sm sm:text-base mt-1">
                You have {unscratchedCards.length} Scratch Card waiting!
              </h3>
              <p className="text-xs text-amber-100/90 mt-0.5">
                Scratch to reveal guaranteed instant cashback credited to your wallet.
              </p>
            </div>
          </div>

          <button className="h-10 px-4 rounded-2xl bg-white text-slate-950 text-xs font-black shrink-0 group-hover:scale-105 transition shadow-md">
            Scratch Now →
          </button>
        </div>
      )}

      {/* Spin & Win Daily Teaser */}
      {canSpinToday && (
        <div
          onClick={() => onNavigate('rewards')}
          className="cursor-pointer rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-950 to-[#0c0d24] border border-indigo-500/30 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xl"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xl shrink-0">
              🎡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-white text-sm">
                  Daily Spin & Win Wheel is Ready!
                </h4>
                <span className="rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-black px-1.5 py-0.2">
                  FREE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Spin once every 24 hours to win up to ₹250 instant cashback.
              </p>
            </div>
          </div>

          <span className="text-xs font-black text-indigo-400 flex items-center gap-1 shrink-0">
            Spin Wheel <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      )}

      {/* Live Daily Cashback Offers */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-400" />
            <h2 className="font-extrabold text-white text-base">
              Verified Daily Cashback Offers
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Cashback credited in 3 seconds
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {offers.slice(0, 6).map((offer) => (
            <div
              key={offer.id}
              className="rounded-3xl bg-[#0b1021] border border-slate-800/80 p-4 hover:border-emerald-500/40 transition shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-2xl bg-[#131b36] border border-slate-700/60 flex items-center justify-center text-xl shadow-inner">
                    {offer.merchantLogo}
                  </div>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-black text-emerald-400">
                    {offer.cashbackPercentage}% CASHBACK
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm">
                  {offer.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {offer.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Min Spend: ₹{offer.minTransactionInr}
                </span>

                <button
                  onClick={() => onOpenPayModal(`${offer.merchantName.toLowerCase().replace(/\s+/g, '')}@upi`, offer.title)}
                  className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition"
                >
                  Pay & Earn →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral & Invite Friends Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0c1830] to-[#070e1c] border border-emerald-500/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 text-2xl shrink-0 shadow-lg shadow-emerald-500/20">
            🤝
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">
              Invite Friends & Earn Flat ₹50 Cash!
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Share code <span className="font-mono text-emerald-400 font-bold">{user.referralCode}</span>. When your friend makes their 1st UPI payment, both get ₹50!
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('rewards')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black hover:bg-emerald-400 transition shadow-md shrink-0 flex items-center justify-center gap-1.5"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Share Referral</span>
        </button>
      </div>

      {/* Recent Transactions Preview */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-extrabold text-white text-base">
            Recent Verified Transactions
          </h2>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            View All →
          </button>
        </div>

        <div className="rounded-3xl bg-[#0b1021] border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-lg">
          {recentTransactions.slice(0, 4).map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-[#0e162c] transition">
              <div className="flex items-center gap-3.5">
                <div
                  className={`h-10 w-10 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 ${
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
                    <span>{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
          ))}
        </div>
      </div>
    </div>
  );
};
