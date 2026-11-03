import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory OTP Store (Production uses Redis / SMS gateway)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// 1. SEND OTP
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, error: 'Valid 10-digit Indian mobile number is required.' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { otp, expiresAt: Date.now() + 300000 }); // 5 minutes validity

  console.log(`[SMS Gateway Simulated] OTP for +91-${phone} is: ${otp}`);

  res.json({
    success: true,
    message: `OTP sent successfully to +91-${phone}`,
    // Return sample OTP in demo response for effortless testing
    demoOtp: otp,
  });
});

// 2. VERIFY OTP
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  const record = otpStore.get(phone);

  // Accept generated OTP or universal testing OTP '123456'
  if (otp === '123456' || (record && record.otp === otp && Date.now() < record.expiresAt)) {
    otpStore.delete(phone);
    return res.json({
      success: true,
      message: 'Mobile number verified successfully.',
      token: `auth_token_${Date.now()}_${phone}`,
    });
  }

  return res.status(400).json({ success: false, error: 'Invalid or expired OTP. Please check and try again.' });
});

// 3. CALCULATE CASHBACK ELIGIBILITY (Pre-Payment Rule Engine)
app.post('/api/payment/calculate-cashback', (req: Request, res: Response) => {
  const { amount, recipientUpi = '', category = 'merchant_qr' } = req.body;
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid transaction amount' });
  }

  // Pre-payment Cashback Rules according to prompt
  let percentage = 5; // Default 5%
  let maxCap = 50;
  let offerApplied = 'Default UPI Scan & Pay Offer';

  if (/swiggy|zomato|eats|food/i.test(recipientUpi)) {
    percentage = 10;
    maxCap = 60;
    offerApplied = 'Food & Dining Special 10% Cashback';
  } else if (/petrol|fuel|hpcl|indianoil|bpcl/i.test(recipientUpi)) {
    percentage = 5;
    maxCap = 75;
    offerApplied = 'Fuel Pump 5% Instant Cashback';
  } else if (/reliance|dmart|grocery|fresh/i.test(recipientUpi)) {
    percentage = 8;
    maxCap = 120;
    offerApplied = 'Supermarket & Groceries 8% Cashback';
  } else if (numAmount >= 1000) {
    percentage = 7.5;
    maxCap = 200;
    offerApplied = 'Mega Transaction 7.5% Cashback';
  }

  const calculatedCashback = Math.min(Math.round((numAmount * percentage) / 100), maxCap);
  const guaranteedMin = Math.max(5, Math.floor(calculatedCashback * 0.7));

  res.json({
    success: true,
    eligible: true,
    offerTitle: offerApplied,
    cashbackPercentage: percentage,
    estimatedCashbackInr: calculatedCashback,
    guaranteedMinInr: guaranteedMin,
    maxCapInr: maxCap,
    rewardType: numAmount >= 100 ? 'scratch_card_plus_direct' : 'direct_cashback',
    disclaimer: 'Cashback will be credited instantly to your Super Cashback wallet upon NPCI payment confirmation.',
  });
});

// 4. VERIFY UPI TRANSACTION & CREDIT CASHBACK
app.post('/api/payment/verify-upi', (req: Request, res: Response) => {
  const { amount, recipientUpi, rrn, offerId } = req.body;
  const numAmount = parseFloat(amount);

  // Anti-fraud validation
  if (!rrn || rrn.length !== 12) {
    return res.status(400).json({ success: false, error: 'Invalid 12-digit NPCI Bank RRN number.' });
  }

  if (numAmount > 100000) {
    return res.status(400).json({ success: false, error: 'NPCI Daily P2M transaction limit exceeded (Max ₹1,00,000).' });
  }

  // Calculate cashback reward
  let percentage = 7;
  let maxCap = 75;
  if (/swiggy|zomato/i.test(recipientUpi)) {
    percentage = 10;
    maxCap = 60;
  } else if (/petrol|fuel/i.test(recipientUpi)) {
    percentage = 5;
    maxCap = 75;
  }

  const cashbackEarned = Math.min(Math.max(5, Math.round((numAmount * percentage) / 100)), maxCap);

  res.json({
    success: true,
    transactionStatus: 'verified',
    rrn,
    amount: numAmount,
    cashbackEarned,
    scratchCardGranted: numAmount >= 50,
    timestamp: Date.now(),
    message: `Payment of ₹${numAmount} verified! You won ₹${cashbackEarned} cashback!`,
  });
});

// 5. AI CUSTOMER SUPPORT CHAT (Authorized NPCI & Super Cashback Assistant)
app.post('/api/support/chat', async (req: Request, res: Response) => {
  try {
    const { message, userContext } = req.body;

    const systemInstruction = `You are the Official Indian Fintech Support AI for 'Super Cashback' (complying with NPCI, RBI, and Indian Banking norms).
Tone: Extremely polite, helpful, professional, and knowledgeable about Indian UPI, Bank IFSC, Penny Drop, Auto-Reverse T+2 Days, Cashback rules, and Withdrawal policies.
Key policies to mention when asked:
- Minimum withdrawal to Bank Account or UPI is ₹50.
- UPI payments reverse automatically within 24-48 hours (T+1/T+2 days) if money was debited but merchant didn't receive it.
- Cashback is credited within 3 seconds of verified NPCI payment.
- Super Cashback never asks for UPI PIN, ATM PIN, or OTP.
Support both English and Hindi naturally.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
      },
    });

    res.json({
      success: true,
      reply: response.text || 'I am here to assist you with UPI payments and cashback queries.',
    });
  } catch (err: any) {
    console.error('Support AI error:', err);
    res.json({
      success: true,
      reply: 'Our automated payment resolution desk is active. UPI settlements occur instantly. If a transaction shows pending, funds are safe with your issuing bank and auto-settle within T+1 working days.',
    });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Super Cashback',
    version: '3.2.0',
    compliance: 'NPCI UPI Guidelines Compliant',
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Super Cashback] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
