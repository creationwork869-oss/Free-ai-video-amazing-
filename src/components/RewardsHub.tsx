import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Gift,
  Sparkles,
  Share2,
  Copy,
  Check,
  RotateCw,
  Trophy,
  Coins,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { ScratchCard, User, Wallet } from '../types';
import { storage } from '../utils/storage';
import { fintechAudio } from '../utils/audio';

interface RewardsHubProps {
  user: User;
  wallet: Wallet;
  scratchCards: ScratchCard[];
  canSpinToday: boolean;
  onRefreshData: () => void;
}

export const RewardsHub: React.FC<RewardsHubProps> = ({
  user,
  wallet,
  scratchCards,
  canSpinToday: initialCanSpin,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'scratch' | 'spin' | 'referral'>('scratch');
  const [copiedCode, setCopiedCode] = useState(false);

  // Scratch card active in modal
  const [activeCardToScratch, setActiveCardToScratch] = useState<ScratchCard | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratchedEnough, setIsScratchedEnough] = useState(false);
  const [scratchedAmountWon, setScratchedAmountWon] = useState<number | null>(null);

  // Spin & Win state
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDeg, setSpinDeg] = useState(0);
  const [canSpin, setCanSpin] = useState(initialCanSpin);
  const [spinRewardWon, setSpinRewardWon] = useState<number | null>(null);

  const wheelSegments = [
    { label: '₹15', amount: 15, color: '#10b981' },
    { label: '₹50', amount: 50, color: '#f59e0b' },
    { label: '₹10', amount: 10, color: '#3b82f6' },
    { label: '₹100 🏆', amount: 100, color: '#ec4899', isJackpot: true },
    { label: '₹25', amount: 25, color: '#8b5cf6' },
    { label: '₹35', amount: 35, color: '#06b6d4' },
    { label: '₹250 💥', amount: 250, color: '#f97316', isJackpot: true },
    { label: '₹20', amount: 20, color: '#14b8a6' },
  ];

  // Confetti helper
  const fireConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
    });
  };

  // Copy referral code
  const handleCopyReferral = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareReferral = () => {
    const shareText = `Use my invite code ${user.referralCode} on Super Cashback to earn guaranteed ₹50 instant cashback on your first UPI payment! Download now: https://supercashback.in/app`;
    if (navigator.share) {
      navigator.share({
        title: 'Super Cashback Invite',
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyReferral();
    }
  };

  // Setup interactive HTML5 Scratch Canvas
  useEffect(() => {
    if (!activeCardToScratch || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with metallic golden gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.5, '#fbbf24');
    grad.addColorStop(1, '#d97706');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative text on scratch surface
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE TO WIN', canvas.width / 2, canvas.height / 2 - 8);
    ctx.font = '12px sans-serif';
    ctx.fillText('✨ Super Cashback ✨', canvas.width / 2, canvas.height / 2 + 16);

    let isDrawing = false;
    let scratchedPixels = 0;
    const totalPixels = canvas.width * canvas.height;

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      scratchedPixels += 800; // approximation
      if (!isScratchedEnough && scratchedPixels > totalPixels * 0.45) {
        setIsScratchedEnough(true);
        const won = storage.revealScratchCard(activeCardToScratch.id);
        setScratchedAmountWon(won);
        fintechAudio.playCashbackWon();
        fireConfetti();
        onRefreshData();
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      scratch(clientX - rect.left, clientY - rect.top);
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      scratch(clientX - rect.left, clientY - rect.top);
    };

    const handlePointerUp = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', handlePointerDown);
    canvas.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('touchstart', handlePointerDown);
      canvas.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [activeCardToScratch]);

  // Handle Spin Wheel
  const handleSpinWheel = () => {
    if (!canSpin || isSpinning) return;
    setIsSpinning(true);
    setSpinRewardWon(null);

    // Pick random segment
    const chosenIndex = Math.floor(Math.random() * wheelSegments.length);
    const chosenSegment = wheelSegments[chosenIndex];

    const degreesPerSeg = 360 / wheelSegments.length;
    // Add multiple rotations + target angle
    const targetDegrees = 360 * 5 + (360 - chosenIndex * degreesPerSeg - degreesPerSeg / 2);

    setSpinDeg(targetDegrees);

    // Play tick interval
    const tickInterval = setInterval(() => {
      fintechAudio.playTick();
    }, 180);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setCanSpin(false);
      storage.recordSpinCompleted();
      storage.creditCashback(chosenSegment.amount, `Spin & Win Prize (${chosenSegment.label})`);
      setSpinRewardWon(chosenSegment.amount);
      fintechAudio.playCashbackWon();
      fireConfetti();
      onRefreshData();
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Rewards Hub & Scratch Cards
            </h1>
            <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 text-[10px] font-black uppercase">
              100% REAL CASH
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Earned cashback is directly credited to your withdrawable wallet balance.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-2xl bg-[#090f20] border border-slate-800 p-1">
          {[
            { id: 'scratch' as const, label: 'Scratch Cards' },
            { id: 'spin' as const, label: 'Spin & Win' },
            { id: 'referral' as const, label: 'Referral (₹50)' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === t.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SCRATCH CARDS */}
      {activeTab === 'scratch' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {scratchCards.map((card) => (
              <div
                key={card.id}
                onClick={() => {
                  if (!card.isScratched) {
                    setActiveCardToScratch(card);
                    setIsScratchedEnough(false);
                    setScratchedAmountWon(null);
                  }
                }}
                className={`cursor-pointer relative overflow-hidden rounded-3xl p-5 border transition flex flex-col justify-between aspect-[4/5] ${
                  card.isScratched
                    ? 'bg-[#090e1f] border-slate-800/80 opacity-80'
                    : 'bg-gradient-to-br from-amber-600/30 via-[#181308] to-[#0d0a04] border-amber-400/50 hover:scale-[1.02] shadow-xl shadow-amber-500/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">
                      {card.isScratched ? '✅' : '🎁'}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        card.isScratched
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-amber-400 text-slate-950 animate-pulse'
                      }`}
                    >
                      {card.isScratched ? 'SCRATCHED' : 'UNSCRATCHED'}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {card.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-center">
                  {card.isScratched ? (
                    <div>
                      <span className="text-[10px] text-slate-500 block">Won & Credited</span>
                      <span className="text-xl font-black text-emerald-400 font-mono">
                        +₹{card.rewardAmount}.00
                      </span>
                    </div>
                  ) : (
                    <div className="py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                      Tap to Scratch ✨
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SPIN & WIN LUCKY WHEEL */}
      {activeTab === 'spin' && (
        <div className="rounded-3xl bg-[#0c1327] border border-slate-800/80 p-6 md:p-8 shadow-2xl text-center space-y-6">
          <div className="max-w-md mx-auto">
            <span className="rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              DAILY LUCKY CASH WHEEL
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
              Spin to Win Instant UPI Cashback!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Every registered user gets 1 free spin every 24 hours. Real money directly credited to your wallet.
            </p>
          </div>

          {/* Wheel Container */}
          <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 my-4">
            {/* Center Pointer / Arrow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-30 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-md" />

            {/* Rotating Wheel Circle */}
            <div
              className="w-full h-full rounded-full border-4 border-amber-400 overflow-hidden shadow-2xl relative transition-transform duration-[4000ms] ease-out"
              style={{
                transform: `rotate(${spinDeg}deg)`,
                background: 'conic-gradient(#10b981 0deg 45deg, #f59e0b 45deg 90deg, #3b82f6 90deg 135deg, #ec4899 135deg 180deg, #8b5cf6 180deg 225deg, #06b6d4 225deg 270deg, #f97316 270deg 315deg, #14b8a6 315deg 360deg)',
              }}
            >
              {/* Wheel Slice Labels */}
              {wheelSegments.map((seg, idx) => {
                const rot = idx * 45 + 22.5;
                return (
                  <div
                    key={idx}
                    className="absolute w-full h-full text-center flex justify-center pt-3 text-xs font-black text-white drop-shadow"
                    style={{ transform: `rotate(${rot}deg)` }}
                  >
                    <span>{seg.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Center Spin Hub Button */}
            <button
              onClick={handleSpinWheel}
              disabled={!canSpin || isSpinning}
              className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-slate-950 border-4 border-amber-400 text-amber-300 font-black text-xs shadow-xl flex items-center justify-center hover:scale-105 transition disabled:opacity-50 z-20"
            >
              {isSpinning ? 'SPIN...' : canSpin ? 'SPIN!' : 'DONE'}
            </button>
          </div>

          {/* Reward Won Alert */}
          {spinRewardWon !== null && (
            <div className="rounded-2xl bg-emerald-950/70 border border-emerald-500/50 p-4 text-emerald-200 text-sm font-bold animate-bounce flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>Woohoo! You won ₹{spinRewardWon}.00 instant cashback from the wheel!</span>
            </div>
          )}

          {!canSpin && !isSpinning && spinRewardWon === null && (
            <p className="text-xs text-slate-500 font-medium">
              ⏰ Daily spin used for today. Next free spin unlocks tomorrow at 00:00 AM!
            </p>
          )}
        </div>
      )}

      {/* TAB 3: REFERRAL PROGRAM */}
      {activeTab === 'referral' && (
        <div className="rounded-3xl bg-[#0c1327] border border-slate-800/80 p-6 md:p-8 shadow-2xl space-y-6">
          <div className="text-center max-w-lg mx-auto">
            <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              UNLIMITED REFERRAL PROGRAM
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
              Refer Friends & Earn ₹50 Cash Every Time!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              No limits on referrals. When your friends download the Android APK and make their 1st UPI payment, both of you get flat ₹50.
            </p>
          </div>

          {/* Referral Code Box */}
          <div className="max-w-md mx-auto rounded-2xl bg-[#060a14] border border-emerald-500/40 p-4 flex items-center justify-between gap-3 shadow-inner">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Your Referral Code</span>
              <span className="text-lg font-black text-emerald-300 font-mono tracking-widest">
                {user.referralCode}
              </span>
            </div>

            <button
              onClick={handleCopyReferral}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
            >
              {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Share Buttons */}
          <div className="max-w-md mx-auto flex gap-3">
            <button
              onClick={handleShareReferral}
              className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-3.5 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/25 hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Share via WhatsApp / SMS</span>
            </button>
          </div>

          {/* 3 Step Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
            <div className="rounded-2xl bg-[#080d1a] p-4 text-center">
              <span className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs inline-flex items-center justify-center mb-2">1</span>
              <h4 className="text-xs font-bold text-white">Share Referral Link</h4>
              <p className="text-[11px] text-slate-400 mt-1">Send your invite link to friends & family.</p>
            </div>
            <div className="rounded-2xl bg-[#080d1a] p-4 text-center">
              <span className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs inline-flex items-center justify-center mb-2">2</span>
              <h4 className="text-xs font-bold text-white">Friend Pays with UPI</h4>
              <p className="text-[11px] text-slate-400 mt-1">They complete their first UPI QR scan.</p>
            </div>
            <div className="rounded-2xl bg-[#080d1a] p-4 text-center">
              <span className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs inline-flex items-center justify-center mb-2">3</span>
              <h4 className="text-xs font-bold text-white">Both Get ₹50 Cash</h4>
              <p className="text-[11px] text-slate-400 mt-1">Withdrawable directly to linked bank account.</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Scratch Card Peeling Modal */}
      {activeCardToScratch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0b1224] border border-amber-400/50 p-6 shadow-2xl text-center space-y-4">
            <button
              onClick={() => setActiveCardToScratch(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                SCRATCH & WIN REWARD
              </span>
              <h3 className="text-base font-extrabold text-white mt-1">
                {activeCardToScratch.title}
              </h3>
            </div>

            {/* Canvas Scratch Foil Layer */}
            <div className="relative mx-auto w-64 h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950 via-[#071322] to-slate-950 border-2 border-amber-400/60 shadow-xl flex items-center justify-center">
              {/* Underlying Reward Hidden Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <span className="text-3xl mb-1">🎉</span>
                <span className="text-xs text-slate-400 font-semibold">YOU WON</span>
                <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight my-1">
                  ₹{activeCardToScratch.rewardAmount}.00
                </span>
                <span className="text-[11px] text-slate-400">Credited to Super Cashback Wallet</span>
              </div>

              {/* The Scratch Foil Canvas on top */}
              <canvas
                ref={canvasRef}
                width={256}
                height={256}
                className="absolute inset-0 cursor-crosshair touch-none"
              />
            </div>

            {isScratchedEnough ? (
              <div className="space-y-2">
                <p className="text-xs text-emerald-400 font-bold">
                  ✨ ₹{scratchedAmountWon || activeCardToScratch.rewardAmount} successfully added to wallet balance!
                </p>
                <button
                  onClick={() => setActiveCardToScratch(null)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black hover:bg-emerald-400 transition"
                >
                  Collect & Close
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 animate-pulse">
                👉 Rub with your finger or cursor to scratch off the gold foil!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
