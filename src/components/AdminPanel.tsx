import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  TrendingUp,
  Percent,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowUpRight,
  Sliders,
  DollarSign,
  AlertTriangle,
  RotateCw,
  Search,
} from 'lucide-react';
import { CashbackOffer, WithdrawalRequest, AdminStats, FraudAlert, User } from '../types';
import { storage } from '../utils/storage';

interface AdminPanelProps {
  onCloseAdmin: () => void;
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onCloseAdmin,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'offers' | 'withdrawals' | 'fraud' | 'users'>('metrics');
  const [stats, setStats] = useState<AdminStats>(() => storage.getAdminStats());
  const [offers, setOffers] = useState<CashbackOffer[]>(() => storage.getOffers());
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => storage.getWithdrawals());
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>(() => storage.getFraudAlerts());

  // New offer modal
  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [newOfferTitle, setNewOfferTitle] = useState('');
  const [newOfferMerchant, setNewOfferMerchant] = useState('');
  const [newOfferPercentage, setNewOfferPercentage] = useState('10');
  const [newOfferMaxCap, setNewOfferMaxCap] = useState('75');
  const [newOfferMinSpend, setNewOfferMinSpend] = useState('200');

  // Toggle Offer Active
  const handleToggleOffer = (id: string, current: boolean) => {
    storage.updateOffer(id, { isActive: !current });
    setOffers(storage.getOffers());
    setStats(storage.getAdminStats());
    onRefreshData();
  };

  // Approve / Reject Withdrawal
  const handleWithdrawalAction = (id: string, action: 'approve' | 'reject') => {
    storage.adminActionWithdrawal(id, action);
    setWithdrawals(storage.getWithdrawals());
    setStats(storage.getAdminStats());
    onRefreshData();
  };

  // Add New Offer
  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferTitle || !newOfferMerchant) return;

    const offer: CashbackOffer = {
      id: `off-admin-${Date.now()}`,
      title: newOfferTitle,
      category: 'merchant_qr',
      description: `Pay via UPI at ${newOfferMerchant} and get ${newOfferPercentage}% cashback.`,
      cashbackPercentage: parseFloat(newOfferPercentage),
      maxCashbackInr: parseFloat(newOfferMaxCap),
      minTransactionInr: parseFloat(newOfferMinSpend),
      merchantName: newOfferMerchant,
      merchantLogo: '🏷️',
      expiresAt: '2026-12-31',
      isActive: true,
      totalClaimed: 0,
    };

    storage.addOffer(offer);
    setOffers(storage.getOffers());
    setShowAddOfferModal(false);
    setNewOfferTitle('');
    setNewOfferMerchant('');
    onRefreshData();
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Super Cashback Admin Console
            </h1>
            <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 text-[10px] font-black uppercase">
              SUPER ADMIN
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            NPCI Compliance, Payout Approvals, Rules Configuration & Fraud Monitoring
          </p>
        </div>

        <button
          onClick={onCloseAdmin}
          className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
        >
          Exit Admin Panel →
        </button>
      </div>

      {/* Admin KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-3xl bg-[#0c1428] border border-emerald-500/30 p-4 shadow-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Registered Users</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {stats.totalUsers.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 block">+1,420 this week</span>
        </div>

        <div className="rounded-3xl bg-[#0c1428] border border-slate-800 p-4 shadow-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total UPI Volume</span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            ₹{(stats.totalPaymentVolumeInr / 10000000).toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">NPCI Gross volume</span>
        </div>

        <div className="rounded-3xl bg-[#0c1428] border border-slate-800 p-4 shadow-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cashback Disbursed</span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
            ₹{stats.totalCashbackDistributedInr.toLocaleString()}
          </span>
          <span className="text-[10px] text-amber-300 mt-1 block">Direct Wallet Credits</span>
        </div>

        <div className="rounded-3xl bg-[#0c1428] border border-slate-800 p-4 shadow-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Withdrawals</span>
          <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">
            {stats.pendingWithdrawalsCount} (₹{stats.pendingWithdrawalsAmount})
          </span>
          <span className="text-[10px] text-cyan-300 mt-1 block">Action required</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar border-b border-slate-800">
        {[
          { id: 'metrics' as const, label: 'Analytics & Overview' },
          { id: 'withdrawals' as const, label: `Withdrawal Queue (${withdrawals.filter(w => w.status === 'pending').length})` },
          { id: 'offers' as const, label: `Cashback Offers (${offers.length})` },
          { id: 'fraud' as const, label: `Fraud Detection (${fraudAlerts.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold shrink-0 transition border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: WITHDRAWAL APPROVAL QUEUE */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-extrabold text-white text-base">
              Bank & UPI Withdrawal Requests
            </h3>
            <span className="text-xs text-slate-400">
              Admin review for anti-money laundering compliance
            </span>
          </div>

          <div className="rounded-3xl bg-[#0b1021] border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-lg">
            {withdrawals.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No withdrawal requests in queue.
              </div>
            ) : (
              withdrawals.map((w) => (
                <div key={w.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{w.userName}</span>
                      <span className="font-mono text-xs text-slate-400">+91-{w.userPhone}</span>
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
                    <p className="text-xs text-slate-400 mt-1">
                      Destination: <span className="font-mono text-white">{w.destinationDetail}</span> • Requested: {new Date(w.requestedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-white font-mono">
                      ₹{w.amount.toFixed(2)}
                    </span>

                    {w.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleWithdrawalAction(w.id, 'approve')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black hover:bg-emerald-400 transition"
                        >
                          Approve IMPS
                        </button>
                        <button
                          onClick={() => handleWithdrawalAction(w.id, 'reject')}
                          className="px-3 py-1.5 rounded-xl bg-rose-950 text-rose-300 text-xs font-bold hover:bg-rose-900 transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE OFFERS */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <div>
              <h3 className="font-extrabold text-white text-base">
                Configure Cashback Offers & Rules
              </h3>
              <p className="text-xs text-slate-400">
                Set custom percentages, min spends, and maximum cashback caps.
              </p>
            </div>
            <button
              onClick={() => setShowAddOfferModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black hover:bg-emerald-400 transition flex items-center gap-1.5 shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Offer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="rounded-3xl bg-[#0b1021] border border-slate-800/80 p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{offer.merchantLogo}</span>
                      <span className="font-extrabold text-white text-sm">{offer.merchantName}</span>
                    </div>
                    <button
                      onClick={() => handleToggleOffer(offer.id, offer.isActive)}
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full transition ${
                        offer.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {offer.isActive ? 'ACTIVE' : 'PAUSED'}
                    </button>
                  </div>

                  <h4 className="font-bold text-slate-200 text-xs mt-2">{offer.title}</h4>
                  <div className="grid grid-cols-3 gap-2 text-center mt-3 pt-2 border-t border-slate-800/60">
                    <div className="rounded-xl bg-[#060a14] p-2">
                      <span className="text-[10px] text-slate-500 block">Cashback</span>
                      <span className="font-black text-emerald-400 text-xs font-mono">{offer.cashbackPercentage}%</span>
                    </div>
                    <div className="rounded-xl bg-[#060a14] p-2">
                      <span className="text-[10px] text-slate-500 block">Max Cap</span>
                      <span className="font-black text-white text-xs font-mono">₹{offer.maxCashbackInr}</span>
                    </div>
                    <div className="rounded-xl bg-[#060a14] p-2">
                      <span className="text-[10px] text-slate-500 block">Min Spend</span>
                      <span className="font-black text-white text-xs font-mono">₹{offer.minTransactionInr}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FRAUD DETECTION */}
      {activeTab === 'fraud' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              <span>Anti-Fraud Sentinel & Audit Log</span>
            </h3>
            <span className="text-xs text-slate-400">
              Velocity checks and suspicious UPI pattern flags
            </span>
          </div>

          <div className="rounded-3xl bg-[#0b1021] border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-lg">
            {fraudAlerts.map((alert) => (
              <div key={alert.id} className="p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{alert.userName}</span>
                    <span className="font-mono text-[10px] text-slate-500">{alert.userId}</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded bg-rose-950 text-rose-300">
                      {alert.severity} SEVERITY
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{alert.reason}</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    Detected: {new Date(alert.detectedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: METRICS & CHARTS */}
      {activeTab === 'metrics' && (
        <div className="rounded-3xl bg-[#0b1021] border border-slate-800/80 p-6 space-y-4">
          <h3 className="font-extrabold text-white text-base">
            Cashback Distribution Reports & NPCI Health
          </h3>
          <p className="text-xs text-slate-400">
            Real-time telemetry on payment success rates, cashback claim distribution, and bank settlement latency.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-2xl bg-[#060a14] border border-slate-800 p-4">
              <span className="text-xs text-slate-400 block font-semibold">Payment Success Rate</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">99.82%</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Average latency: 840ms</span>
            </div>
            <div className="rounded-2xl bg-[#060a14] border border-slate-800 p-4">
              <span className="text-xs text-slate-400 block font-semibold">Avg. Cashback per Tx</span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">₹38.50</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Customer retention: 84%</span>
            </div>
            <div className="rounded-2xl bg-[#060a14] border border-slate-800 p-4">
              <span className="text-xs text-slate-400 block font-semibold">Auto-Reversal TAT</span>
              <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">T+1 Day</span>
              <span className="text-[11px] text-slate-500 mt-1 block">100% RBI compliant</span>
            </div>
          </div>
        </div>
      )}

      {/* CREATE OFFER MODAL */}
      {showAddOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0c1224] border border-emerald-500/40 p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-white text-base">Create New Cashback Offer</h3>
            <form onSubmit={handleCreateOffer} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Offer Title</label>
                <input
                  type="text"
                  value={newOfferTitle}
                  onChange={(e) => setNewOfferTitle(e.target.value)}
                  placeholder="e.g. Flat 15% Cashback at Cafe Coffee Day"
                  className="w-full rounded-xl bg-[#060a14] border border-slate-700 p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Merchant Name</label>
                <input
                  type="text"
                  value={newOfferMerchant}
                  onChange={(e) => setNewOfferMerchant(e.target.value)}
                  placeholder="e.g. Cafe Coffee Day"
                  className="w-full rounded-xl bg-[#060a14] border border-slate-700 p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Cashback %</label>
                  <input
                    type="number"
                    value={newOfferPercentage}
                    onChange={(e) => setNewOfferPercentage(e.target.value)}
                    className="w-full rounded-xl bg-[#060a14] border border-slate-700 p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={newOfferMaxCap}
                    onChange={(e) => setNewOfferMaxCap(e.target.value)}
                    className="w-full rounded-xl bg-[#060a14] border border-slate-700 p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Min Spend (₹)</label>
                  <input
                    type="number"
                    value={newOfferMinSpend}
                    onChange={(e) => setNewOfferMinSpend(e.target.value)}
                    className="w-full rounded-xl bg-[#060a14] border border-slate-700 p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddOfferModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 text-xs font-black text-slate-950"
                >
                  Publish Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
