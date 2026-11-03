/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Wallet, CashbackOffer, Transaction, ScratchCard, WithdrawalRequest } from './types';
import { storage } from './utils/storage';
import { Navbar } from './components/Navbar';
import { BottomNav, MainTabId } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { PayModal } from './components/PayModal';
import { RewardsHub } from './components/RewardsHub';
import { WalletView } from './components/WalletView';
import { BankLinkingModal } from './components/BankLinkingModal';
import { TransactionsView } from './components/TransactionsView';
import { AdminPanel } from './components/AdminPanel';
import { SupportModal } from './components/SupportModal';
import { ApkModal } from './components/ApkModal';
import { AuthModal } from './components/AuthModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTabId>('home');
  const [user, setUser] = useState<User>(() => storage.getUser());
  const [wallet, setWallet] = useState<Wallet>(() => storage.getWallet());
  const [offers, setOffers] = useState<CashbackOffer[]>(() => storage.getOffers());
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage.getTransactions());
  const [scratchCards, setScratchCards] = useState<ScratchCard[]>(() => storage.getScratchCards());
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => storage.getWithdrawals());
  const [viewMode, setViewMode] = useState<'phone' | 'desktop'>(() => storage.getViewMode());
  const [canSpinToday, setCanSpinToday] = useState<boolean>(() => storage.canSpinToday());

  // Admin Mode state
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Modals state
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payRecipient, setPayRecipient] = useState('');
  const [payNote, setPayNote] = useState('');
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshAllData = () => {
    setUser(storage.getUser());
    setWallet(storage.getWallet());
    setOffers(storage.getOffers());
    setTransactions(storage.getTransactions());
    setScratchCards(storage.getScratchCards());
    setWithdrawals(storage.getWithdrawals());
    setCanSpinToday(storage.canSpinToday());
  };

  const handleOpenPay = (defaultRecipient = '', defaultNote = '') => {
    setPayRecipient(defaultRecipient);
    setPayNote(defaultNote);
    setIsPayModalOpen(true);
  };

  const handlePaymentCompleted = (tx: Transaction, scratchCard?: ScratchCard) => {
    refreshAllData();
    showToast(`Payment of ₹${tx.amount} verified! +₹${tx.cashbackEarned} cashback credited!`);
  };

  const handleToggleViewMode = () => {
    const next = viewMode === 'phone' ? 'desktop' : 'phone';
    setViewMode(next);
    storage.setViewMode(next);
    showToast(next === 'phone' ? 'Android Mobile View Active' : 'Full Desktop View Active');
  };

  const unscratchedCount = scratchCards.filter((c) => !c.isScratched).length;

  const mainContent = (
    <div className="flex-1 min-w-0 max-w-6xl mx-auto w-full p-3 sm:p-6">
      {isAdminMode ? (
        <AdminPanel
          onCloseAdmin={() => setIsAdminMode(false)}
          onRefreshData={refreshAllData}
        />
      ) : (
        <>
          {activeTab === 'home' && (
            <Dashboard
              user={user}
              wallet={wallet}
              offers={offers}
              recentTransactions={transactions}
              scratchCards={scratchCards}
              canSpinToday={canSpinToday}
              onNavigate={setActiveTab}
              onOpenPayModal={handleOpenPay}
              onOpenWithdrawModal={() => setActiveTab('wallet')}
              onOpenBankModal={() => setIsBankModalOpen(true)}
            />
          )}

          {activeTab === 'scan_pay' && (
            <div className="text-center py-6 space-y-4">
              <button
                onClick={() => handleOpenPay()}
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm shadow-xl"
              >
                Launch QR Scanner & Pay
              </button>
            </div>
          )}

          {activeTab === 'rewards' && (
            <RewardsHub
              user={user}
              wallet={wallet}
              scratchCards={scratchCards}
              canSpinToday={canSpinToday}
              onRefreshData={refreshAllData}
            />
          )}

          {activeTab === 'wallet' && (
            <WalletView
              user={user}
              wallet={wallet}
              withdrawals={withdrawals}
              onOpenBankModal={() => setIsBankModalOpen(true)}
              onRefreshData={refreshAllData}
            />
          )}

          {activeTab === 'history' && (
            <TransactionsView transactions={transactions} />
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-['Inter',sans-serif]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-[#0e1b33] border border-emerald-500/50 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        user={user}
        wallet={wallet}
        isAdminMode={isAdminMode}
        onToggleAdmin={() => setIsAdminMode(!isAdminMode)}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenSupport={() => setIsSupportModalOpen(true)}
        onOpenWallet={() => {
          setIsAdminMode(false);
          setActiveTab('wallet');
        }}
        onOpenProfile={() => setIsAuthModalOpen(true)}
      />

      {/* Content Rendering: Phone Frame Mode vs Desktop Mode */}
      {viewMode === 'phone' && !isAdminMode ? (
        /* Android Phone Frame Mockup */
        <div className="flex-1 flex items-center justify-center p-2 sm:p-6 bg-[#03050a]">
          <div className="relative w-full max-w-[420px] h-[870px] rounded-[52px] bg-[#060a14] border-[10px] border-[#18233c] shadow-[0_0_60px_rgba(16,185,129,0.2)] overflow-hidden flex flex-col">
            {/* Phone Speaker Notch & Camera Pin */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-[#0d1424] rounded-full z-50 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-emerald-400 mr-2" />
              <div className="h-1.5 w-12 rounded-full bg-slate-800" />
            </div>

            {/* Scrollable Mobile App Window */}
            <div className="flex-1 overflow-y-auto pt-6 pb-20 custom-scrollbar">
              {mainContent}
            </div>

            {/* Mobile Bottom Nav */}
            <BottomNav
              activeTab={activeTab}
              onSelectTab={(tab) => {
                if (tab === 'scan_pay') {
                  handleOpenPay();
                } else {
                  setActiveTab(tab);
                }
              }}
              unscratchedCount={unscratchedCount}
            />
          </div>
        </div>
      ) : (
        /* Desktop Full-Screen Studio View */
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
          {mainContent}
        </main>
      )}

      {/* Mobile Bottom Navigation for Native Mobile Screens when not in frame */}
      {viewMode !== 'phone' && !isAdminMode && (
        <div className="md:hidden">
          <BottomNav
            activeTab={activeTab}
            onSelectTab={(tab) => {
              if (tab === 'scan_pay') {
                handleOpenPay();
              } else {
                setActiveTab(tab);
              }
            }}
            unscratchedCount={unscratchedCount}
          />
        </div>
      )}

      {/* MODALS */}
      <PayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        user={user}
        defaultRecipient={payRecipient}
        defaultNote={payNote}
        onPaymentCompleted={handlePaymentCompleted}
      />

      <BankLinkingModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        user={user}
        onBankLinked={() => {
          refreshAllData();
          showToast('Bank account linked & Penny-Drop verified!');
        }}
      />

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      <ApkModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          refreshAllData();
          showToast(`Welcome back, ${loggedInUser.name}!`);
        }}
      />
    </div>
  );
}
