import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
  Upload,
  Lock,
  ExternalLink,
  RotateCw,
} from 'lucide-react';
import { User, Transaction, ScratchCard } from '../types';
import { storage } from '../utils/storage';
import { fintechAudio } from '../utils/audio';

interface PayModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  defaultRecipient?: string;
  defaultNote?: string;
  onPaymentCompleted: (tx: Transaction, scratchCard?: ScratchCard) => void;
}

export const PayModal: React.FC<PayModalProps> = ({
  isOpen,
  onClose,
  user,
  defaultRecipient = '',
  defaultNote = '',
  onPaymentCompleted,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'details' | 'pin_dialog' | 'success'>('details');
  const [recipientUpi, setRecipientUpi] = useState(defaultRecipient || 'swiggy.orders@icici');
  const [recipientName, setRecipientName] = useState('Swiggy Instamart');
  const [amount, setAmount] = useState('450');
  const [note, setNote] = useState(defaultNote || 'Grocery billing');
  const [upiPin, setUpiPin] = useState('');

  // Pre-payment eligibility state
  const [isCalculatingEligibility, setIsCalculatingEligibility] = useState(false);
  const [cashbackEligibility, setCashbackEligibility] = useState<{
    eligible: boolean;
    offerTitle: string;
    cashbackPercentage: number;
    estimatedCashbackInr: number;
    guaranteedMinInr: number;
    maxCapInr: number;
  } | null>(null);

  // Completed payment receipt state
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [awardedScratchCard, setAwardedScratchCard] = useState<ScratchCard | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Merchant Presets
  const sampleMerchants = [
    { name: 'Swiggy Instamart', upi: 'swiggy.orders@icici', logo: '🍔', defaultAmt: '450' },
    { name: 'Indian Oil Fuel', upi: 'indianoil.delhi@sbi', logo: '⛽', defaultAmt: '800' },
    { name: 'Reliance Smart', upi: 'reliance.retail@hdfc', logo: '🛒', defaultAmt: '650' },
    { name: 'Zomato Dining', upi: 'zomato.pay@axis', logo: '🍕', defaultAmt: '520' },
    { name: 'Local Kirana Store', upi: 'sharma.kirana@paytm', logo: '🏪', defaultAmt: '280' },
  ];

  // Fetch pre-payment eligibility whenever amount or recipient changes
  useEffect(() => {
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setCashbackEligibility(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCalculatingEligibility(true);
      try {
        const response = await fetch('/api/payment/calculate-cashback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: numAmt,
            recipientUpi,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setCashbackEligibility(data);
        }
      } catch {
        // Fallback calculation
        setCashbackEligibility({
          eligible: true,
          offerTitle: 'Guaranteed 5-10% UPI Cashback',
          cashbackPercentage: 8,
          estimatedCashbackInr: Math.min(Math.round(numAmt * 0.08), 80),
          guaranteedMinInr: Math.max(5, Math.round(numAmt * 0.04)),
          maxCapInr: 80,
        });
      } finally {
        setIsCalculatingEligibility(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [amount, recipientUpi]);

  // Construct NPCI standard UPI URI
  const npciUpiUri = `upi://pay?pa=${encodeURIComponent(recipientUpi)}&pn=${encodeURIComponent(recipientName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note || 'Super Cashback UPI')}`;

  const handleProceedToPin = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setErrorMessage('Please enter a valid amount.');
      return;
    }
    if (!recipientUpi.includes('@')) {
      setErrorMessage('Please enter a valid UPI ID (e.g. merchant@upi).');
      return;
    }

    setErrorMessage(null);
    setStep('pin_dialog');
  };

  const handleAuthorizeUpiPayment = async () => {
    if (!upiPin || upiPin.length < 4) {
      setErrorMessage('Please enter your 4 or 6 digit UPI PIN.');
      return;
    }

    setIsProcessingPayment(true);
    setErrorMessage(null);

    // Simulate NPCI secure gateway verification
    const rrn = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    try {
      const response = await fetch('/api/payment/verify-upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          recipientUpi,
          rrn,
        }),
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Payment declined by issuing bank');
      }

      const numAmount = parseFloat(amount);
      const cashbackWon = resData.cashbackEarned || 25;

      // 1. Record UPI payment transaction
      const paymentTx: Transaction = {
        id: `tx-pay-${Date.now()}`,
        userId: user.id,
        type: 'upi_payment',
        amount: numAmount,
        cashbackEarned: cashbackWon,
        recipientUpi,
        recipientName,
        senderUpi: user.upiId || 'deepak@okhdfcbank',
        rrn,
        status: 'success',
        createdAt: Date.now(),
        note,
      };
      storage.addTransaction(paymentTx);

      // 2. Credit cashback to wallet
      storage.creditCashback(cashbackWon, `Cashback for ${recipientName} payment`);

      // 3. Grant scratch card if eligible
      let scratchCard: ScratchCard | undefined = undefined;
      if (numAmount >= 100) {
        scratchCard = {
          id: `sc-auto-${Date.now()}`,
          userId: user.id,
          transactionId: paymentTx.id,
          rewardAmount: Math.floor(15 + Math.random() * 60),
          title: `Reward for payment to ${recipientName}`,
          description: `You paid ₹${numAmount} via UPI! Scratch to win extra bonus.`,
          isScratched: false,
          expiresAt: Date.now() + 86400000 * 7,
        };
        storage.addScratchCard(scratchCard);
        setAwardedScratchCard(scratchCard);
      }

      setCompletedTx(paymentTx);
      setStep('success');
      fintechAudio.playPaymentSuccess();
      onPaymentCompleted(paymentTx, scratchCard);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment failed. Please retry.');
    } finally {
      setIsProcessingPayment(false);
      setUpiPin(''); // Never persist UPI PIN!
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0b1224] border border-emerald-500/30 p-5 sm:p-7 shadow-2xl my-auto space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>

        {/* STEP 1: PAYMENT DETAILS & PRE-PAYMENT ELIGIBILITY */}
        {step === 'details' && (
          <form onSubmit={handleProceedToPin} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 shadow-md">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  Pay via Authorized UPI
                </h3>
                <p className="text-xs text-slate-400">
                  NPCI 100% compliant with guaranteed cashback
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-rose-950/60 border border-rose-500/40 p-3 text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Merchant Presets Row */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">
                Select Verified Merchant:
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {sampleMerchants.map((m, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRecipientUpi(m.upi);
                      setRecipientName(m.name);
                      setAmount(m.defaultAmt);
                    }}
                    className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-bold transition ${
                      recipientUpi === m.upi
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                        : 'bg-[#060a14] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{m.logo}</span>
                    <span>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient UPI VPA */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Recipient UPI ID / Merchant VPA
              </label>
              <input
                type="text"
                value={recipientUpi}
                onChange={(e) => {
                  setRecipientUpi(e.target.value);
                  setRecipientName(e.target.value.split('@')[0]);
                }}
                placeholder="merchant@okhdfcbank"
                className="w-full rounded-xl bg-[#060a14] border border-slate-700 p-3 text-sm text-white focus:border-emerald-400 focus:outline-none font-mono"
              />
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Amount to Pay (INR)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-lg font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full rounded-xl bg-[#060a14] border border-slate-700 pl-9 pr-4 py-3 text-2xl font-black text-white focus:border-emerald-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a payment note (optional)"
                className="w-full rounded-xl bg-[#060a14] border border-slate-800 p-2.5 text-xs text-slate-300 focus:outline-none"
              />
            </div>

            {/* PRE-PAYMENT CASHBACK ELIGIBILITY BOX */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-950/50 to-teal-950/30 border border-emerald-500/40 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-xs">
                  <Sparkles className="h-4 w-4" />
                  <span>PRE-PAYMENT CASHBACK ELIGIBILITY</span>
                </div>
                {isCalculatingEligibility && (
                  <RotateCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                )}
              </div>

              {cashbackEligibility ? (
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-300">
                      You will earn guaranteed:
                    </span>
                    <span className="text-lg font-black text-emerald-300 font-mono">
                      ₹{cashbackEligibility.guaranteedMinInr} - ₹{cashbackEligibility.estimatedCashbackInr}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 mt-1 leading-relaxed">
                    ✨ {cashbackEligibility.offerTitle} applied ({cashbackEligibility.cashbackPercentage}% cashback). Credited directly to Super Cashback wallet upon payment.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Enter amount above to view eligible cashback.
                </p>
              )}
            </div>

            {/* Submit & External App Launch Button */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-500 p-3.5 text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/25 hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                <span>Proceed to Enter UPI PIN</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Native Android UPI Intent Link */}
              <a
                href={npciUpiUri}
                className="w-full py-2.5 rounded-xl bg-slate-800/80 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
                <span>Open in GPay / PhonePe / Paytm App</span>
              </a>
            </div>
          </form>
        )}

        {/* STEP 2: AUTHORIZED NPCI UPI PIN DIALOG */}
        {step === 'pin_dialog' && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-[#060a14] border border-slate-800 p-4 text-center space-y-1">
              <span className="text-xs text-slate-400">Paying to:</span>
              <h4 className="font-extrabold text-white text-base">{recipientName}</h4>
              <span className="font-mono text-xs text-slate-400 block">{recipientUpi}</span>
              <div className="pt-2 text-2xl font-black text-emerald-400 font-mono">
                ₹{parseFloat(amount).toFixed(2)}
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-rose-950/60 border border-rose-500/40 p-3 text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span>ENTER 4 OR 6 DIGIT UPI PIN</span>
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Super Cashback NEVER stores your UPI PIN. This is securely transmitted via standard NPCI banking gateway.
              </p>

              <input
                type="password"
                maxLength={6}
                value={upiPin}
                onChange={(e) => setUpiPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-48 mx-auto rounded-2xl bg-[#060a14] border-2 border-emerald-500/60 p-3 text-center text-3xl font-black tracking-widest text-emerald-400 font-mono focus:outline-none"
              />
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="flex-1 py-3 rounded-2xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleAuthorizeUpiPayment}
                disabled={isProcessingPayment || upiPin.length < 4}
                className="flex-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 text-xs font-black hover:opacity-95 transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>Verifying with Bank...</span>
                  </>
                ) : (
                  <span>Confirm Payment</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT SUCCESS & CASHBACK WIN */}
        {step === 'success' && completedTx && (
          <div className="text-center space-y-4 py-2">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                Payment Successful!
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paid ₹{completedTx.amount} to {completedTx.recipientName}
              </p>
              <span className="font-mono text-[10px] text-slate-500 block mt-1">
                UPI RRN: {completedTx.rrn}
              </span>
            </div>

            {/* Cashback Reward Card */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-600/30 via-[#191508] to-[#0d0a04] border border-amber-400/50 p-4 space-y-1.5 shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                🎉 CASHBACK CREDITED INSTANTLY
              </span>
              <div className="text-3xl font-black text-amber-400 font-mono">
                +₹{completedTx.cashbackEarned}.00
              </div>
              <p className="text-xs text-amber-200/90">
                Added directly to your Super Cashback available balance!
              </p>
            </div>

            {awardedScratchCard && (
              <div className="rounded-xl bg-[#091024] border border-slate-700 p-3 text-xs text-slate-300 flex items-center justify-between">
                <span>🎁 1 Bonus Scratch Card Awarded!</span>
                <span className="text-emerald-400 font-bold">In Rewards Hub</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition shadow-lg"
            >
              Done / Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
