export type TransactionType = 'upi_payment' | 'cashback_credit' | 'withdrawal' | 'referral_bonus' | 'scratch_card_win' | 'spin_win';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'rejected';
export type KycStatus = 'verified' | 'pending' | 'unverified';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  upiId?: string;
  kycStatus: KycStatus;
  referralCode: string;
  referredBy?: string;
  joinedAt: number;
  isBlocked: boolean;
  linkedBank?: {
    accountHolderName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
    isVerified: boolean;
  };
}

export interface Wallet {
  availableBalance: number; // in INR
  lifetimeCashback: number;
  pendingCashback: number;
  totalWithdrawn: number;
}

export interface CashbackOffer {
  id: string;
  title: string;
  category: 'merchant_qr' | 'online_shopping' | 'food_dining' | 'utilities' | 'travel';
  description: string;
  cashbackPercentage: number;
  maxCashbackInr: number;
  minTransactionInr: number;
  merchantName: string;
  merchantLogo: string;
  expiresAt: string;
  isActive: boolean;
  totalClaimed: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  cashbackEarned?: number;
  recipientUpi?: string;
  recipientName?: string;
  senderUpi?: string;
  rrn: string; // 12-digit Bank/NPCI Retrieval Reference Number
  status: TransactionStatus;
  createdAt: number;
  note?: string;
  offerId?: string;
}

export interface ScratchCard {
  id: string;
  userId: string;
  transactionId?: string;
  rewardAmount: number; // in INR
  title: string;
  description: string;
  isScratched: boolean;
  scratchedAt?: number;
  expiresAt: number;
}

export interface SpinReward {
  id: string;
  label: string;
  amount: number;
  color: string;
  isJackpot?: boolean;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  payoutMethod: 'upi' | 'bank_account';
  destinationDetail: string; // UPI ID or Account Number
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: number;
  reviewedAt?: number;
  rejectionReason?: string;
  referenceNumber?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalPaymentVolumeInr: number;
  totalCashbackDistributedInr: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsAmount: number;
  activeOffersCount: number;
  fraudAlertsCount: number;
}

export interface FraudAlert {
  id: string;
  userId: string;
  userName: string;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  detectedAt: number;
  isResolved: boolean;
}
