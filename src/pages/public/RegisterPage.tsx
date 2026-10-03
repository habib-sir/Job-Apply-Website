import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, ShieldCheck, KeyRound, Smartphone, RotateCcw, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { Spinner } from '../../components/common/Spinner';
import { sendRegistrationOtp, verifyRegistrationOtp, normalizeMobile } from '../../services/smsService';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [localError, setLocalError] = useState('');
  const [countdown, setCountdown] = useState(180); // 3 minutes
  const [canResend, setCanResend] = useState(false);

  const { registerUser, user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    let timer: any = null;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          if (prev <= 150) {
            setCanResend(true); // Allow resend after 30 seconds
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  if (authLoading || user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" text="ড্যাশবোর্ডে প্রবেশ করা হচ্ছে..." />
      </div>
    );
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Send OTP via SMS Gateway
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    const clean = normalizeMobile(mobile);
    if (!/^01[3-9]\d{8}$/.test(clean)) {
      setLocalError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
      return;
    }

    if (!password || password.length < 6) {
      setLocalError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('উভয় পাসওয়ার্ড একই হতে হবে');
      return;
    }

    setLoading(true);
    try {
      await sendRegistrationOtp(clean);
      setStep('otp');
      setCountdown(180);
      setCanResend(false);
      setOtpCode('');
      success(`আপনার ${clean} নম্বরে ৪ ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে।`);
    } catch (err: any) {
      setLocalError(err.message || 'ভেরিফিকেশন কোড পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || resending) return;
    setLocalError('');
    setResending(true);
    try {
      await sendRegistrationOtp(mobile);
      setCountdown(180);
      setCanResend(false);
      success('নতুন ভেরিফিকেশন কোড পাঠানো হয়েছে!');
    } catch (err: any) {
      setLocalError(err.message || 'পুনরায় কোড পাঠানো সম্ভব হয়নি।');
    } finally {
      setResending(false);
    }
  };

  // Step 3: Verify OTP & Complete Registration
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 4) {
      setLocalError('অনুগ্রহ করে ৪ ডিজিটের সঠিক ভেরিফিকেশন কোড লিখুন');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP in Firestore otps collection
      await verifyRegistrationOtp(mobile, cleanOtp);

      // 2. Register user account in Firebase Auth
      await registerUser(mobile, password);

      success('নম্বর ভেরিফিকেশন সফল! আপনার অ্যাকাউন্ট তৈরি সম্পন্ন হয়েছে।');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setLocalError(err.message || 'ভেরিফিকেশন ব্যর্থ হয়েছে। কোডটি পুনরায় চেক করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        {step === 'form' ? (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">নতুন অ্যাকাউন্ট তৈরি</h2>
              <p className="text-xs text-gray-500 mt-1">
                চাকরির সহজে আবেদন ও সিভি সংরক্ষণের জন্য রেজিস্ট্রেশন করুন
              </p>
            </div>

            {localError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-lg">
                {localError}
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-4">
              <Input
                label="মোবাইল নম্বর"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                requiredStar
                helperText="১১ ডিজিটের সচল মোবাইল নম্বর (এই নম্বরে SMS OTP যাবে)"
                maxLength={11}
                disabled={loading}
              />

              <Input
                label="পাসওয়ার্ড"
                type="password"
                placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                requiredStar
                disabled={loading}
              />

              <Input
                label="পাসওয়ার্ড নিশ্চিত করুন"
                type="password"
                placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                requiredStar
                disabled={loading}
              />

              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg flex items-start gap-2 text-[11px] text-emerald-800">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  আপনার নম্বরে একটি ৪ ডিজিটের ফ্রি SMS কোড পাঠানো হবে। শুধুমাত্র অ্যাকাউন্ট তৈরির সময়ই একবার ভেরিফাই করতে হবে।
                </span>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                OTP কোড পাঠান ও এগিয়ে যান
              </Button>
            </form>
          </>
        ) : (
          /* Step 2: OTP Verification */
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">মোবাইল নম্বর ভেরিফিকেশন</h2>
              <p className="text-xs text-gray-600 mt-1.5 flex items-center justify-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{mobile} নম্বরে ৪ ডিজিটের কোড পাঠানো হয়েছে</span>
              </p>
            </div>

            {localError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-lg">
                {localError}
              </div>
            )}

            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 text-center">
                  ৪ ডিজিটের ভেরিফিকেশন কোড লিখুন
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  autoFocus
                  placeholder="••••"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  disabled={loading}
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold py-3 px-4 rounded-xl border-2 border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 bg-white shadow-xs"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 px-1 pt-1">
                <span>
                  {countdown > 0 ? (
                    <span className="text-emerald-700 font-medium">⏳ কোডের মেয়াদ: {formatTimer(countdown)}</span>
                  ) : (
                    <span className="text-rose-600 font-medium">কোডের মেয়াদ শেষ</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || resending}
                  className={`inline-flex items-center gap-1 font-semibold ${
                    canResend ? 'text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer' : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>{resending ? 'পাঠানো হচ্ছে...' : 'পুনরায় কোড পাঠান'}</span>
                </button>
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                loading={loading}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                ভেরিফাই ও অ্যাকাউন্ট তৈরি করুন
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setLocalError('');
                }}
                disabled={loading}
                className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ভুল নম্বর? পরিবর্তন করুন</span>
              </button>
            </form>
          </>
        )}

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-600">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
            <Link
              to="/login"
              className="font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              লগইন করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

