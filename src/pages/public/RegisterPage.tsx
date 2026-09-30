import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';

export const RegisterPage: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('উভয় পাসওয়ার্ড একই হতে হবে');
      return;
    }

    setLoading(true);
    try {
      await registerUser(mobile, password);
      success('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম।');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setLocalError(err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="মোবাইল নম্বর"
            type="tel"
            placeholder="01XXXXXXXXX"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            requiredStar
            helperText="১১ ডিজিটের বাংলাদেশি সচল মোবাইল নম্বর দিন"
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

          <div className="p-3 bg-emerald-50/60 rounded-lg flex items-start gap-2 text-[11px] text-emerald-800">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>আপনার মোবাইল নম্বর ও তথ্য সম্পূর্ণ সুরক্ষিত থাকবে এবং শুধুমাত্র চাকরির আবেদনে ব্যবহৃত হবে।</span>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            অ্যাকাউন্ট তৈরি করুন
          </Button>
        </form>

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
