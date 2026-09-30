import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Lock, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { GoogleSignInButton } from '../../components/common/GoogleSignInButton';
import { useToast } from '../../components/common/Toast';

export const LoginPage: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { loginUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { success } = useToast();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleGoogleLogin = async () => {
    setLocalError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      success('Google অ্যাকাউন্ট দিয়ে সফলভাবে লগইন হয়েছে!');
      navigate(from, { replace: true });
    } catch (err: any) {
      setLocalError(err.message || 'Google দিয়ে লগইন ব্যর্থ হয়েছে');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      await loginUser(mobile, password);
      success('সফলভাবে লগইন হয়েছে!');
      navigate(from, { replace: true });
    } catch (err: any) {
      setLocalError(err.message || 'লগইন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">ইউজার লগইন</h2>
          <p className="text-xs text-gray-500 mt-1">
            আপনার নিবন্ধিত মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে প্রবেশ করুন
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
            placeholder="017XXXXXXXX"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            requiredStar
            helperText="১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর"
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

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            লগইন করুন
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-[11px] text-gray-400 font-medium">অথবা</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <div className="mt-4">
          <GoogleSignInButton
            onClick={handleGoogleLogin}
            loading={googleLoading}
            text="Google দিয়ে প্রবেশ করুন"
            className="w-full"
          />
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-600">
            নতুন ব্যবহারকারী?{' '}
            <Link
              to="/register"
              className="font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              বিনামূল্যে অ্যাকাউন্ট খুলুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
