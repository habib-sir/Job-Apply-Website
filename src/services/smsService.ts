import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface SendOtpResult {
  success: boolean;
  message: string;
  debugCode?: string;
}

/**
 * Normalizes a Bangladeshi mobile number to 11 digits (01XXXXXXXXX).
 */
export function normalizeMobile(input: string): string {
  const digits = input.replace(/[^0-9]/g, '');
  if (digits.startsWith('8801') && digits.length === 13) {
    return digits.substring(2);
  }
  return digits;
}

// -------------------------------------------------------------
// Client-Side Anti-Spam / Device Rate Limiting
// -------------------------------------------------------------
const DEVICE_RATE_KEY = 'bdjob_sms_device_ratelimit_v1';
const MAX_DEVICE_REQUESTS_PER_10_MIN = 5;
const MIN_DEVICE_INTERVAL_MS = 25000; // 25 seconds between any request from this device

function checkAndRecordDeviceRateLimit(): void {
  try {
    const now = Date.now();
    const stored = localStorage.getItem(DEVICE_RATE_KEY);
    let history: number[] = [];
    if (stored) {
      try {
        history = JSON.parse(stored);
        if (!Array.isArray(history)) history = [];
      } catch {
        history = [];
      }
    }

    // Filter to last 10 minutes
    const tenMinAgo = now - 10 * 60 * 1000;
    history = history.filter((t) => typeof t === 'number' && t > tenMinAgo);

    // 1. Check interval from last request
    if (history.length > 0) {
      const lastReq = history[history.length - 1];
      const elapsed = now - lastReq;
      if (elapsed < MIN_DEVICE_INTERVAL_MS) {
        const waitSec = Math.ceil((MIN_DEVICE_INTERVAL_MS - elapsed) / 1000);
        throw new Error(
          `স্প্যামিং রোধে প্রতি অনুরোধের মাঝে বিরতি প্রয়োজন। অনুগ্রহ করে ${waitSec} সেকেন্ড অপেক্ষা করে আবার চেষ্টা করুন।`
        );
      }
    }

    // 2. Check total requests in 10-minute window
    if (history.length >= MAX_DEVICE_REQUESTS_PER_10_MIN) {
      throw new Error(
        'আপনার ব্রাউজার থেকে অতিরিক্ত এসএমএস অনুরোধ করা হয়েছে (অ্যান্টি-স্প্যাম সুরক্ষা)। অনুগ্রহ করে ১০ মিনিট অপেক্ষা করুন।'
      );
    }

    // Record this attempt
    history.push(now);
    localStorage.setItem(DEVICE_RATE_KEY, JSON.stringify(history));
  } catch (err: any) {
    if (err.message?.includes('স্প্যামিং') || err.message?.includes('অতিরিক্ত এসএমএস')) {
      throw err;
    }
    // If localStorage fails (private mode), silently pass
  }
}

// -------------------------------------------------------------
// Core SMS OTP Dispatch with Multi-Layer Anti-Spam Protection
// -------------------------------------------------------------

/**
 * Sends a 4-digit registration OTP via the Android SMS Gateway queue and stores it in Firestore.
 * Includes strict Anti-SMS-Bombing & Cooldown defenses:
 * 1. 60-second cooldown per phone number
 * 2. Max 3 requests per phone number in 15 minutes (with auto 15-minute lock)
 * 3. Client/Device throttling to prevent rotating through arbitrary numbers
 */
export async function sendRegistrationOtp(mobile: string): Promise<SendOtpResult> {
  const cleanMobile = normalizeMobile(mobile);
  if (!/^01[3-9]\d{8}$/.test(cleanMobile)) {
    throw new Error('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
  }

  // 1. Device-level anti-spam check
  checkAndRecordDeviceRateLimit();

  const now = Date.now();
  const otpRef = doc(db, 'otps', cleanMobile);

  // 2. Database-level anti-spam check for this specific mobile number
  try {
    const existingSnap = await getDoc(otpRef);
    if (existingSnap.exists()) {
      const prevData = existingSnap.data();

      // Check if number is currently blocked
      if (prevData.blockedUntil && now < Number(prevData.blockedUntil)) {
        const remainingMin = Math.max(1, Math.ceil((Number(prevData.blockedUntil) - now) / 60000));
        throw new Error(
          `অতিরিক্ত চেষ্টার কারণে এই নম্বরে এসএমএস সাময়িকভাবে স্থগিত রয়েছে (SMS Bombing সুরক্ষা)। অনুগ্রহ করে ${remainingMin} মিনিট পর চেষ্টা করুন।`
        );
      }

      // Check 60-second minimum cooldown
      if (prevData.lastSentAt) {
        const diffMs = now - Number(prevData.lastSentAt);
        if (diffMs < 60000) {
          const waitSec = Math.ceil((60000 - diffMs) / 1000);
          throw new Error(
            `ইতিমধ্যে এই নম্বরে কোড পাঠানো হয়েছে। স্প্যাম রোধে আবার পাঠাতে ${waitSec} সেকেন্ড অপেক্ষা করুন।`
          );
        }
      }

      // Check 15-minute rolling window count
      const windowStart = Number(prevData.windowStart || 0);
      let requestCount = Number(prevData.requestCount || 0);

      if (windowStart && now - windowStart < 15 * 60 * 1000) {
        requestCount += 1;
        if (requestCount > 3) {
          // Exceeded 3 requests in 15 minutes -> Lock for 15 minutes!
          const lockUntil = now + 15 * 60 * 1000;
          await setDoc(
            otpRef,
            {
              ...prevData,
              blockedUntil: lockUntil,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
          throw new Error(
            '১৫ মিনিটে ৩ বারের বেশি এসএমএস অনুরোধ করা হয়েছে (অ্যান্টি-স্প্যাম লক)। নম্বরটি ১৫ মিনিটের জন্য স্থগিত করা হলো।'
          );
        }
      } else {
        // Reset 15-minute window
        prevData.windowStart = now;
        requestCount = 1;
      }
    }
  } catch (err: any) {
    if (err.message && (err.message.includes('অপেক্ষা') || err.message.includes('সুরক্ষা') || err.message.includes('স্থগিত'))) {
      throw err;
    }
    // Proceed if document doesn't exist or transient network read
  }

  // 3. Generate 4-digit code (e.g. 5831)
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = now + 3 * 60 * 1000; // 3 minutes validity
  const smsBody = `বিডি জব ক্যারিয়ার পোর্টাল ভেরিফিকেশন কোড: ${code}। আপনার অ্যাকাউন্ট তৈরি সম্পন্ন করতে কোডটি দিন।`;

  // 4. Save verification record in Firestore otps collection with rate-limit state
  const prevDoc = (await getDoc(otpRef).catch(() => null))?.data() || {};
  const currentCount = (prevDoc.windowStart && now - Number(prevDoc.windowStart) < 15 * 60 * 1000)
    ? (Number(prevDoc.requestCount) || 0) + 1
    : 1;

  await setDoc(otpRef, {
    mobile: cleanMobile,
    code,
    expiresAt,
    lastSentAt: now,
    windowStart: prevDoc.windowStart && now - Number(prevDoc.windowStart) < 15 * 60 * 1000 ? prevDoc.windowStart : now,
    requestCount: currentCount,
    failedAttempts: 0,
    createdAt: new Date().toISOString(),
  });

  // 5. Queue outbound SMS for Android SMS Gateway
  const jobId = `otp_${cleanMobile}_${now}`;
  try {
    const queueRef = doc(db, 'smsQueue', jobId);
    await setDoc(queueRef, {
      id: jobId,
      recipient: cleanMobile,
      body: smsBody,
      status: 'pending',
      type: 'otp',
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Queue SMS error (non-fatal):', err);
  }

  // 6. Attempt direct local / extension bridge dispatch if active
  try {
    fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient: cleanMobile, body: smsBody }),
    }).catch(() => {});
  } catch {}

  return {
    success: true,
    message: `${cleanMobile} নম্বরে ৪ ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে।`,
    debugCode: code,
  };
}

/**
 * Verifies the 4-digit OTP entered by the user with Brute-Force defense:
 * - Max 3 failed attempts allowed per code.
 * - After 3 wrong attempts, the code is immediately deleted and the number is locked for 10 minutes.
 */
export async function verifyRegistrationOtp(mobile: string, enteredCode: string): Promise<boolean> {
  const cleanMobile = normalizeMobile(mobile);
  const otpRef = doc(db, 'otps', cleanMobile);
  const snap = await getDoc(otpRef);

  if (!snap.exists()) {
    throw new Error('কোনো সক্রিয় ভেরিফিকেশন কোড পাওয়া যায়নি। অনুগ্রহ করে আবার কোড পাঠান।');
  }

  const data = snap.data();
  if (!data || !data.code) {
    throw new Error('অবৈধ ওটিপি ডাটা। অনুগ্রহ করে আবার চেষ্টা করুন।');
  }

  const now = Date.now();

  // Check if currently blocked
  if (data.blockedUntil && now < Number(data.blockedUntil)) {
    const mins = Math.max(1, Math.ceil((Number(data.blockedUntil) - now) / 60000));
    throw new Error(`ভুল কোড বারবার দেওয়ার কারণে এই নম্বরটি স্থগিত রয়েছে। ${mins} মিনিট পর আবার চেষ্টা করুন।`);
  }

  // Check expiration (3 minutes)
  if (now > Number(data.expiresAt || 0)) {
    await deleteDoc(otpRef).catch(() => {});
    throw new Error('কোডের ৩ মিনিটের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে "কোড পুনরায় পাঠান" এ ক্লিক করুন।');
  }

  // Brute force check:
  if (data.code.trim() !== enteredCode.trim()) {
    const failed = (Number(data.failedAttempts) || 0) + 1;
    if (failed >= 3) {
      // 3 failed attempts: destroy OTP and lock for 10 minutes
      await setDoc(
        otpRef,
        {
          code: '', // invalidate code
          expiresAt: 0,
          failedAttempts: failed,
          blockedUntil: now + 10 * 60 * 1000,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      throw new Error(
        'ভুল কোড ৩ বার দেওয়া হয়েছে! নিরাপত্তার স্বার্থে এই কোডটি বাতিল করা হয়েছে এবং ১০ মিনিটের জন্য লক করা হয়েছে।'
      );
    } else {
      await setDoc(otpRef, { failedAttempts: failed }, { merge: true });
      const remaining = 3 - failed;
      throw new Error(
        `ভেরিফিকেশন কোডটি সঠিক নয়। আর ${remaining} বার চেষ্টা করতে পারবেন।`
      );
    }
  }

  // Success: clean up OTP record completely so it cannot be reused
  await deleteDoc(otpRef).catch(() => {});
  return true;
}
