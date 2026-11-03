import React from 'react';
import {
  ShieldCheck,
  Smartphone,
  Monitor,
  Download,
  Wallet,
  Settings,
  User as UserIcon,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { User, Wallet as WalletType } from '../types';

interface NavbarProps {
  user: User;
  wallet: WalletType;
  isAdminMode: boolean;
  onToggleAdmin: () => void;
  viewMode: 'phone' | 'desktop';
  onToggleViewMode: () => void;
  onOpenApkModal: () => void;
  onOpenSupport: () => void;
  onOpenWallet: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  wallet,
  isAdminMode,
  onToggleAdmin,
  viewMode,
  onToggleViewMode,
  onOpenApkModal,
  onOpenSupport,
  onOpenWallet,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-950/40 bg-[#060913]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 items-center justify-between px-3 md:px-6 max-w-7xl">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 p-[2px] shadow-lg shadow-emerald-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#070d1d]">
              <span className="font-black text-amber-400 text-lg leading-none">₹</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-white text-base md:text-lg">
                SUPER <span className="text-emerald-400">CASHBACK</span>
              </span>
              <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                UPI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Guaranteed Cashback on Every UPI Payment
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wallet Balance Badge */}
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-2 rounded-2xl bg-[#0d1427] border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-white hover:border-emerald-400 transition shadow-inner group"
          >
            <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <div className="text-left">
              <span className="text-[9px] text-slate-400 uppercase block font-semibold leading-tight">Cashback</span>
              <span className="font-mono text-emerald-300 font-extrabold text-xs">
                ₹{wallet.availableBalance.toFixed(2)}
              </span>
            </div>
          </button>

          {/* Admin Dashboard Switch */}
          <button
            onClick={onToggleAdmin}
            className={`hidden sm:flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold border transition ${
              isAdminMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-[#0b1021] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="Toggle Admin Panel"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>{isAdminMode ? 'Exit Admin' : 'Admin Panel'}</span>
          </button>

          {/* Android APK Download */}
          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Android</span>
            <span>APK</span>
          </button>

          {/* Phone Frame View Switcher */}
          <button
            onClick={onToggleViewMode}
            className="hidden md:flex items-center gap-1.5 rounded-xl bg-[#0b1021] border border-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
            title={viewMode === 'phone' ? 'Switch to Full Desktop View' : 'Preview Android Mobile Frame'}
          >
            {viewMode === 'phone' ? (
              <>
                <Monitor className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px]">Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-[11px]">Phone View</span>
              </>
            )}
          </button>

          {/* Support */}
          <button
            onClick={onOpenSupport}
            className="p-2 rounded-xl bg-[#0b1021] border border-slate-800 text-slate-300 hover:text-white transition"
            title="NPCI Support & Help Desk"
          >
            <HelpCircle className="h-4 w-4 text-emerald-400" />
          </button>

          {/* User Profile */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-800/60 transition"
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {user.name[0]}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
