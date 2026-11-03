import React from 'react';
import {
  Home,
  QrCode,
  Gift,
  Wallet,
  Clock,
  Sparkles,
} from 'lucide-react';

export type MainTabId = 'home' | 'scan_pay' | 'rewards' | 'wallet' | 'history';

interface BottomNavProps {
  activeTab: MainTabId;
  onSelectTab: (tab: MainTabId) => void;
  unscratchedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  unscratchedCount,
}) => {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'rewards' as const, label: 'Rewards', icon: Gift, badge: unscratchedCount > 0 ? unscratchedCount : undefined },
    { id: 'scan_pay' as const, label: 'Scan & Pay', icon: QrCode, isFab: true },
    { id: 'wallet' as const, label: 'Wallet', icon: Wallet },
    { id: 'history' as const, label: 'History', icon: Clock },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#060913]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          if (t.isFab) {
            return (
              <button
                key={t.id}
                onClick={() => onSelectTab(t.id)}
                className="relative -top-4 flex flex-col items-center group"
              >
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/35 border-4 border-[#060913] group-hover:scale-105 transition">
                  <QrCode className="h-7 w-7 text-slate-950" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 -mt-0.5">
                  Scan & Pay
                </span>
              </button>
            );
          }

          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''}`} />
                {t.badge && (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center">
                    {t.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                )}
              </div>
              <span className="text-[10px] font-medium mt-1">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
