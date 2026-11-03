import {
  User,
  Wallet,
  CashbackOffer,
  Transaction,
  ScratchCard,
  WithdrawalRequest,
  AdminStats,
  FraudAlert,
} from '../types';

const STORAGE_KEYS = {
  USER: 'supercash_user_v1',
  WALLET: 'supercash_wallet_v1',
  OFFERS: 'supercash_offers_v1',
  TRANSACTIONS: 'supercash_txs_v1',
  SCRATCH_CARDS: 'supercash_cards_v1',
  WITHDRAWALS: 'supercash_withdrawals_v1',
  FRAUD_ALERTS: 'supercash_fraud_v1',
  LAST_SPIN_DATE: 'supercash_last_spin_v1',
  VIEW_MODE: 'supercash_view_mode_v1',
};

// Initial Seed User
const DEFAULT_USER: User = {
  id: 'usr-98765',
  name: 'Deepak Sharma',
  phone: '9876543210',
  email: 'deepak.sharma@example.com',
  upiId: 'deepak@okhdfcbank',
  kycStatus: 'verified',
  referralCode: 'SUPERCASH99',
  joinedAt: Date.now() - 30 * 86400000,
  isBlocked: false,
  linkedBank: {
    accountHolderName: 'Deepak Sharma',
    accountNumber: '50100492817291',
    ifsc: 'HDFC0000128',
    bankName: 'HDFC Bank Ltd',
    isVerified: true,
  },
};

// Initial Wallet
const DEFAULT_WALLET: Wallet = {
  availableBalance: 420.00,
  lifetimeCashback: 2350.00,
  pendingCashback: 45.00,
  totalWithdrawn: 1885.00,
};

// Seed Offers (Configurable by Admin)
const DEFAULT_OFFERS: CashbackOffer[] = [
  {
    id: 'off-swiggy',
    title: 'Flat 10% Cashback on Swiggy Orders',
    category: 'food_dining',
    description: 'Pay via any UPI on Swiggy and get flat 10% instant cashback up to ₹60.',
    cashbackPercentage: 10,
    maxCashbackInr: 60,
    minTransactionInr: 200,
    merchantName: 'Swiggy Food & Instamart',
    merchantLogo: '🍔',
    expiresAt: '2026-12-31',
    isActive: true,
    totalClaimed: 18420,
  },
  {
    id: 'off-petrol',
    title: '5% Instant Cashback at Indian Oil / HPCL',
    category: 'travel',
    description: 'Scan & Pay at any petrol pump via Super Cashback UPI and earn up to ₹75.',
    cashbackPercentage: 5,
    maxCashbackInr: 75,
    minTransactionInr: 500,
    merchantName: 'Indian Oil & HPCL Pumps',
    merchantLogo: '⛽',
    expiresAt: '2026-11-30',
    isActive: true,
    totalClaimed: 32190,
  },
  {
    id: 'off-reliance',
    title: '8% Cashback at Reliance Smart & Fresh',
    category: 'merchant_qr',
    description: 'Scan merchant UPI QR at billing counter. Min spend ₹400.',
    cashbackPercentage: 8,
    maxCashbackInr: 120,
    minTransactionInr: 400,
    merchantName: 'Reliance Smart Superstore',
    merchantLogo: '🛒',
    expiresAt: '2026-12-15',
    isActive: true,
    totalClaimed: 14200,
  },
  {
    id: 'off-electricity',
    title: 'Flat ₹30 on Electricity & Water Bills',
    category: 'utilities',
    description: 'Pay electricity bill using BBPS UPI handle and earn guaranteed ₹30 cashback.',
    cashbackPercentage: 6,
    maxCashbackInr: 30,
    minTransactionInr: 300,
    merchantName: 'State Electricity Board',
    merchantLogo: '⚡',
    expiresAt: '2026-11-30',
    isActive: true,
    totalClaimed: 9540,
  },
  {
    id: 'off-zomato',
    title: 'Flat 12% Cashback on Zomato Gold',
    category: 'food_dining',
    description: 'Order your favorite food and get instant cashback to wallet.',
    cashbackPercentage: 12,
    maxCashbackInr: 80,
    minTransactionInr: 250,
    merchantName: 'Zomato Dining & Delivery',
    merchantLogo: '🍕',
    expiresAt: '2026-12-31',
    isActive: true,
    totalClaimed: 24900,
  },
  {
    id: 'off-flipkart',
    title: '7.5% Cashback on Flipkart Electronics',
    category: 'online_shopping',
    description: 'Pay with UPI on Flipkart checkout. Minimum transaction ₹1,000.',
    cashbackPercentage: 7.5,
    maxCashbackInr: 250,
    minTransactionInr: 1000,
    merchantName: 'Flipkart India',
    merchantLogo: '📱',
    expiresAt: '2026-12-25',
    isActive: true,
    totalClaimed: 41200,
  },
];

// Seed Transactions
const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    userId: 'usr-98765',
    type: 'upi_payment',
    amount: 540.00,
    cashbackEarned: 54.00,
    recipientUpi: 'swiggy.orders@icici',
    recipientName: 'Swiggy Instamart',
    senderUpi: 'deepak@okhdfcbank',
    rrn: '430582910482',
    status: 'success',
    createdAt: Date.now() - 3600000 * 4,
    note: 'Dinner & Groceries order',
    offerId: 'off-swiggy',
  },
  {
    id: 'tx-102',
    userId: 'usr-98765',
    type: 'cashback_credit',
    amount: 54.00,
    rrn: '430582910483',
    status: 'success',
    createdAt: Date.now() - 3600000 * 3.8,
    note: 'Instant Cashback from Swiggy (10%)',
  },
  {
    id: 'tx-103',
    userId: 'usr-98765',
    type: 'upi_payment',
    amount: 1200.00,
    cashbackEarned: 60.00,
    recipientUpi: 'indianoil.delhi@sbi',
    recipientName: 'Indian Oil Retail Outlet',
    senderUpi: 'deepak@okhdfcbank',
    rrn: '430519283741',
    status: 'success',
    createdAt: Date.now() - 86400000 * 2,
    note: 'Petrol Fuel Fill',
    offerId: 'off-petrol',
  },
  {
    id: 'tx-104',
    userId: 'usr-98765',
    type: 'withdrawal',
    amount: 500.00,
    recipientName: 'HDFC Bank - 7291',
    rrn: 'PAYOUT-8921849',
    status: 'success',
    createdAt: Date.now() - 86400000 * 4,
    note: 'Cashback transfer to HDFC Account',
  },
  {
    id: 'tx-105',
    userId: 'usr-98765',
    type: 'referral_bonus',
    amount: 50.00,
    rrn: 'REF-39184920',
    status: 'success',
    createdAt: Date.now() - 86400000 * 6,
    note: 'Referral reward from Rahul Sharma',
  },
];

// Seed Scratch Cards
const DEFAULT_SCRATCH_CARDS: ScratchCard[] = [
  {
    id: 'sc-1',
    userId: 'usr-98765',
    rewardAmount: 38.00,
    title: 'UPI Merchant Payment Reward',
    description: 'You earned a scratch card for paying ₹540 via UPI!',
    isScratched: false,
    expiresAt: Date.now() + 86400000 * 7,
  },
  {
    id: 'sc-2',
    userId: 'usr-98765',
    rewardAmount: 25.00,
    title: 'Fuel Payment Surprise',
    description: 'Cashback rewarded for Indian Oil QR scan.',
    isScratched: true,
    scratchedAt: Date.now() - 86400000 * 2,
    expiresAt: Date.now() + 86400000 * 5,
  },
  {
    id: 'sc-3',
    userId: 'usr-98765',
    rewardAmount: 65.00,
    title: 'Weekend Shopping Bonanza',
    description: 'Mega reward on grocery supermarket billing.',
    isScratched: true,
    scratchedAt: Date.now() - 86400000 * 5,
    expiresAt: Date.now() + 86400000 * 2,
  },
];

// Seed Withdrawals
const DEFAULT_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'wdr-1',
    userId: 'usr-98765',
    userName: 'Deepak Sharma',
    userPhone: '9876543210',
    amount: 500.00,
    payoutMethod: 'bank_account',
    destinationDetail: 'HDFC Bank (A/C: ...7291)',
    status: 'approved',
    requestedAt: Date.now() - 86400000 * 4,
    reviewedAt: Date.now() - 86400000 * 4 + 300000,
    referenceNumber: 'IMPS43091823901',
  },
];

// Seed Fraud Alerts
const DEFAULT_FRAUD_ALERTS: FraudAlert[] = [
  {
    id: 'fa-1',
    userId: 'usr-11029',
    userName: 'Amit Verma',
    severity: 'medium',
    reason: 'Rapid velocity: 5 UPI payments under 2 minutes to same merchant QR',
    detectedAt: Date.now() - 3600000 * 12,
    isResolved: false,
  },
];

export const storage = {
  // USER
  getUser(): User {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) return JSON.parse(data);
    } catch {}
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  },

  updateUser(user: Partial<User>): User {
    const current = this.getUser();
    const updated = { ...current, ...user };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    return updated;
  },

  // WALLET
  getWallet(): Wallet {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WALLET);
      if (data) return JSON.parse(data);
    } catch {}
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(DEFAULT_WALLET));
    return DEFAULT_WALLET;
  },

  updateWallet(changes: Partial<Wallet>): Wallet {
    const current = this.getWallet();
    const updated = { ...current, ...changes };
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(updated));
    return updated;
  },

  creditCashback(amount: number, reason: string): void {
    const wallet = this.getWallet();
    wallet.availableBalance += amount;
    wallet.lifetimeCashback += amount;
    this.updateWallet(wallet);

    // Record credit transaction
    this.addTransaction({
      id: `tx-cb-${Date.now()}`,
      userId: this.getUser().id,
      type: 'cashback_credit',
      amount,
      rrn: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      status: 'success',
      createdAt: Date.now(),
      note: reason,
    });
  },

  // OFFERS
  getOffers(): CashbackOffer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFERS);
      if (data) return JSON.parse(data);
    } catch {}
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(DEFAULT_OFFERS));
    return DEFAULT_OFFERS;
  },

  saveOffers(offers: CashbackOffer[]): void {
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
  },

  addOffer(offer: CashbackOffer): void {
    const list = this.getOffers();
    list.unshift(offer);
    this.saveOffers(list);
  },

  updateOffer(offerId: string, changes: Partial<CashbackOffer>): void {
    const list = this.getOffers();
    const idx = list.findIndex((o) => o.id === offerId);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...changes };
      this.saveOffers(list);
    }
  },

  // TRANSACTIONS
  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (data) return JSON.parse(data);
    } catch {}
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
    return DEFAULT_TRANSACTIONS;
  },

  addTransaction(tx: Transaction): void {
    const list = this.getTransactions();
    list.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
  },

  // SCRATCH CARDS
  getScratchCards(): ScratchCard[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCRATCH_CARDS);
      if (data) return JSON.parse(data);
    } catch {}
    localStorage.setItem(STORAGE_KEYS.SCRATCH_CARDS, JSON.stringify(DEFAULT_SCRATCH_CARDS));
    return DEFAULT_SCRATCH_CARDS;
  },

  addScratchCard(card: ScratchCard): void {
    const list = this.getScratchCards();
    list.unshift(card);
    localStorage.setItem(STORAGE_KEYS.SCRATCH_CARDS, JSON.stringify(list));
  },

  revealScratchCard(id: string): number {
    const list = this.getScratchCards();
    const card = list.find((c) => c.id === id);
    if (card && !card.isScratched) {
      card.isScratched = true;
      card.scratchedAt = Date.now();
      localStorage.setItem(STORAGE_KEYS.SCRATCH_CARDS, JSON.stringify(list));
      this.creditCashback(card.rewardAmount, `Scratch Card Win: ${card.title}`);
      return card.rewardAmount;
    }
    return 0;
  },

  // WITHDRAWALS
  getWithdrawals(): WithdrawalRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
      if (data) return JSON.parse(data);
    } catch {}
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(DEFAULT_WITHDRAWALS));
    return DEFAULT_WITHDRAWALS;
  },

  requestWithdrawal(amount: number, method: 'upi' | 'bank_account'): { success: boolean; message: string } {
    const wallet = this.getWallet();
    const user = this.getUser();

    if (amount < 50) {
      return { success: false, message: 'Minimum withdrawal amount is ₹50.' };
    }
    if (wallet.availableBalance < amount) {
      return { success: false, message: 'Insufficient cashback balance.' };
    }

    let destination = user.upiId || 'UPI';
    if (method === 'bank_account') {
      if (!user.linkedBank) {
        return { success: false, message: 'Please link a verified bank account first.' };
      }
      destination = `${user.linkedBank.bankName} (A/C: ...${user.linkedBank.accountNumber.slice(-4)})`;
    }

    // Deduct from available balance immediately
    wallet.availableBalance -= amount;
    this.updateWallet(wallet);

    const newReq: WithdrawalRequest = {
      id: `wdr-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      amount,
      payoutMethod: method,
      destinationDetail: destination,
      status: 'pending',
      requestedAt: Date.now(),
    };

    const list = this.getWithdrawals();
    list.unshift(newReq);
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(list));

    // Also record in transactions
    this.addTransaction({
      id: `tx-wdr-${Date.now()}`,
      userId: user.id,
      type: 'withdrawal',
      amount,
      recipientName: destination,
      rrn: `REQ-${Math.floor(10000000 + Math.random() * 90000000)}`,
      status: 'pending',
      createdAt: Date.now(),
      note: `Cashback withdrawal request to ${destination}`,
    });

    return { success: true, message: `Withdrawal request of ₹${amount} submitted successfully!` };
  },

  adminActionWithdrawal(id: string, action: 'approve' | 'reject', reason?: string): void {
    const list = this.getWithdrawals();
    const req = list.find((w) => w.id === id);
    if (!req || req.status !== 'pending') return;

    if (action === 'approve') {
      req.status = 'approved';
      req.reviewedAt = Date.now();
      req.referenceNumber = `IMPS${Math.floor(10000000000 + Math.random() * 90000000000)}`;

      // Update wallet totalWithdrawn
      const wallet = this.getWallet();
      wallet.totalWithdrawn += req.amount;
      this.updateWallet(wallet);
    } else {
      req.status = 'rejected';
      req.reviewedAt = Date.now();
      req.rejectionReason = reason || 'Bank compliance verification failed';

      // Refund to wallet available balance
      const wallet = this.getWallet();
      wallet.availableBalance += req.amount;
      this.updateWallet(wallet);
    }

    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(list));
  },

  // FRAUD ALERTS
  getFraudAlerts(): FraudAlert[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FRAUD_ALERTS);
      if (data) return JSON.parse(data);
    } catch {}
    localStorage.setItem(STORAGE_KEYS.FRAUD_ALERTS, JSON.stringify(DEFAULT_FRAUD_ALERTS));
    return DEFAULT_FRAUD_ALERTS;
  },

  // DAILY SPIN
  canSpinToday(): boolean {
    const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_SPIN_DATE);
    const today = new Date().toISOString().slice(0, 10);
    return lastDate !== today;
  },

  recordSpinCompleted(): void {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.LAST_SPIN_DATE, today);
  },

  // ADMIN STATS CALCULATION
  getAdminStats(): AdminStats {
    const txs = this.getTransactions();
    const withdrawals = this.getWithdrawals();
    const offers = this.getOffers();
    const fraud = this.getFraudAlerts();

    const paymentTxs = txs.filter((t) => t.type === 'upi_payment' && t.status === 'success');
    const totalVolume = paymentTxs.reduce((sum, t) => sum + t.amount, 0);

    const cashbackTxs = txs.filter((t) => (t.type === 'cashback_credit' || t.type === 'referral_bonus' || t.type === 'scratch_card_win') && t.status === 'success');
    const totalCashback = cashbackTxs.reduce((sum, t) => sum + t.amount, 0) + 125000; // Realistic platform baseline

    const pendingWdr = withdrawals.filter((w) => w.status === 'pending');

    return {
      totalUsers: 142580,
      totalPaymentVolumeInr: totalVolume + 38450000,
      totalCashbackDistributedInr: totalCashback,
      pendingWithdrawalsCount: pendingWdr.length,
      pendingWithdrawalsAmount: pendingWdr.reduce((sum, w) => sum + w.amount, 0),
      activeOffersCount: offers.filter((o) => o.isActive).length,
      fraudAlertsCount: fraud.filter((f) => !f.isResolved).length,
    };
  },

  // VIEW MODE
  getViewMode(): 'phone' | 'desktop' {
    return (localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as 'phone' | 'desktop') || 'phone';
  },

  setViewMode(mode: 'phone' | 'desktop'): void {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
  },
};
