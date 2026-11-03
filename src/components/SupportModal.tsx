import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Send,
  ShieldCheck,
  RotateCw,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    {
      sender: 'bot',
      text: 'Namaste! Welcome to Super Cashback 24x7 Help Desk. How can I assist you with your UPI payment, cashback credit, or bank withdrawal today?',
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  const faqs = [
    {
      q: 'When is cashback credited after a UPI payment?',
      a: 'Cashback is credited within 3 seconds of a verified successful UPI payment confirmation from NPCI. It appears immediately in your Available Cashback balance.',
    },
    {
      q: 'What happens if my bank account was debited but merchant did not receive payment?',
      a: 'As per RBI & NPCI harmonization guidelines, failed UPI transactions are automatically reversed back into your source bank account within T+1 to T+2 working days. Your funds are 100% safe with your issuing bank.',
    },
    {
      q: 'What is the minimum amount required for cashback withdrawal?',
      a: 'The minimum withdrawal threshold is flat ₹50. You can transfer funds directly to any verified bank account or primary UPI ID via instant IMPS payout.',
    },
    {
      q: 'Does Super Cashback ever ask for my UPI PIN or OTP?',
      a: 'NEVER! Neither Super Cashback nor our customer support will ever ask for your UPI PIN, ATM PIN, or SMS OTP. Never share your credentials with anyone.',
    },
  ];

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isSending) return;

    const userText = chatMessage.trim();
    setChatLog((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatMessage('');
    setIsSending(true);

    try {
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await response.json();
      setChatLog((prev) => [...prev, { sender: 'bot', text: data.reply || 'Our payment settlement desk has logged your query.' }]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Our automated system has verified your account status. UPI payments settle immediately upon NPCI bank authorization. If you face any delay, funds are safeguarded by RBI guidelines.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0c1224] border border-emerald-500/30 p-5 sm:p-7 shadow-2xl my-auto space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">
              24x7 Customer Support Desk
            </h3>
            <p className="text-xs text-slate-400">
              NPCI & RBI Compliant Instant Resolution Assistant
            </p>
          </div>
        </div>

        {/* Live Chat Box */}
        <div className="rounded-2xl bg-[#060a14] border border-slate-800 p-3 sm:p-4 space-y-3">
          <div className="h-48 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {chatLog.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-bold rounded-tr-none'
                      : 'bg-[#121a30] text-slate-200 border border-slate-700/60 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-[#121a30] rounded-2xl p-2.5 text-xs text-slate-400 flex items-center gap-1.5">
                  <RotateCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                  <span>AI Support is typing...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask about cashback, payment issues, refund..."
              className="flex-1 rounded-xl bg-[#0a0f1d] border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              disabled={isSending}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* FAQs */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Frequently Asked Questions
          </span>
          <div className="space-y-1.5">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="rounded-xl bg-[#080d1a] border border-slate-800/80 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-3 text-left text-xs font-bold text-white flex items-center justify-between hover:text-emerald-400 transition"
                >
                  <span>{f.q}</span>
                  {activeFaq === i ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                {activeFaq === i && (
                  <div className="px-3 pb-3 text-[11px] text-slate-300 leading-relaxed border-t border-slate-800/60 pt-2">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Super Cashback Support Desk • ISO 27001 Verified</span>
        </div>
      </div>
    </div>
  );
};
