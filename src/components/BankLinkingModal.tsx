import React, { useState } from 'react';
import {
  Building2,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import { User } from '../types';
import { storage } from '../utils/storage';
import { fintechAudio } from '../utils/audio';

interface BankLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onBankLinked: () => void;
}

export const BankLinkingModal: React.FC<BankLinkingModalProps> = ({
  isOpen,
  onClose,
  user,
  onBankLinked,
}) => {
  if (!isOpen) return null;

  const [accountNumber, setAccountNumber] = useState(user.linkedBank?.accountNumber || '');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(user.linkedBank?.accountNumber || '');
  const [ifsc, setIfsc] = useState(user.linkedBank?.ifsc || 'HDFC0000128');
  const [bankName, setBankName] = useState(user.linkedBank?.bankName || 'HDFC Bank Ltd');
  const [accountHolderName, setAccountHolderName] = useState(user.linkedBank?.accountHolderName || user.name);
  const [customUpi, setCustomUpi] = useState(user.upiId || 'deepak@okhdfcbank');

  const [isVerifyingPennyDrop, setIsVerifyingPennyDrop] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLinkBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || accountNumber.length < 9) {
      setErrorMessage('Please enter a valid bank account number (9 to 18 digits).');
      return;
    }
    if (accountNumber !== confirmAccountNumber) {
      setErrorMessage('Bank account numbers do not match.');
      return;
    }
    if (!ifsc || ifsc.length !== 11) {
      setErrorMessage('Please enter a valid 11-character Indian IFSC code (e.g. HDFC0000128).');
      return;
    }

    setErrorMessage(null);
    setIsVerifyingPennyDrop(true);

    // Simulate Penny-Drop Verification (₹1.00 micro-deposit via IMPS to verify name)
    setTimeout(() => {
      setIsVerifyingPennyDrop(false);
      storage.updateUser({
        upiId: customUpi,
        linkedBank: {
          accountHolderName,
          accountNumber,
          ifsc: ifsc.toUpperCase(),
          bankName,
          isVerified: true,
        },
      });

      setSuccessMessage('Penny-drop verified! ₹1.00 deposited and account successfully verified.');
      fintechAudio.playPaymentSuccess();
      onBankLinked();

      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0c1224] border border-emerald-500/30 p-6 shadow-2xl space-y-4 my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">
              Link Bank Account & UPI
            </h3>
            <p className="text-xs text-slate-400">
              For instant 24x7 IMPS cashback withdrawals
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-rose-950/60 border border-rose-500/40 p-3 text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl bg-emerald-950/80 border border-emerald-500/50 p-3 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleLinkBank} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Account Holder Name
            </label>
            <input
              type="text"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              className="w-full rounded-xl bg-[#060a14] border border-slate-700 p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Bank Name
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full rounded-xl bg-[#060a14] border border-slate-700 p-2.5 text-xs text-white"
            >
              <option>HDFC Bank Ltd</option>
              <option>State Bank of India (SBI)</option>
              <option>ICICI Bank</option>
              <option>Axis Bank</option>
              <option>Punjab National Bank</option>
              <option>Kotak Mahindra Bank</option>
              <option>Bank of Baroda</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Bank Account Number
            </label>
            <input
              type="password"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="50100492817291"
              className="w-full rounded-xl bg-[#060a14] border border-slate-700 p-2.5 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Confirm Account Number
            </label>
            <input
              type="text"
              value={confirmAccountNumber}
              onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Re-enter Account Number"
              className="w-full rounded-xl bg-[#060a14] border border-slate-700 p-2.5 text-xs text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                maxLength={11}
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="HDFC0000128"
                className="w-full rounded-xl bg-[#060a14] border border-slate-700 p-2.5 text-xs text-white uppercase font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                UPI ID (VPA)
              </label>
              <input
                type="text"
                value={customUpi}
                onChange={(e) => setCustomUpi(e.target.value)}
                placeholder="user@okhdfcbank"
                className="w-full rounded-xl bg-[#060a14] border border-slate-700 p-2.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Penny Drop Disclaimer */}
          <div className="rounded-xl bg-[#060a14] border border-slate-800 p-3 flex items-start gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Penny Drop: A verification deposit of ₹1.00 is automatically sent to confirm your name matching with NPCI records.
            </span>
          </div>

          <button
            type="submit"
            disabled={isVerifyingPennyDrop}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-3 text-xs font-bold text-slate-950 shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
          >
            {isVerifyingPennyDrop ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Verifying Penny Drop with Bank...</span>
              </>
            ) : (
              <span>Verify & Link Account</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
