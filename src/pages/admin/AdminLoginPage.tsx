import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      await loginAdmin(email, password);
      success('অ্যাডমিন হিসেবে লগইন সফল হয়েছে!');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setLocalError(err.message || 'অ্যাডমিন লগইন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-6 md:p-8 text-white">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">অ্যাডমিন প্রবেশদ্বার</h2>
          <p className="text-xs text-gray-400 mt-1">
            শুধুমাত্র অনুমোদিত অ্যাডমিনের জন্য সংরক্ষিত
          </p>
        </div>

        {localError && (
          <div className="mb-4 p-3 bg-rose-900/50 border border-rose-500/50 text-rose-200 text-xs font-medium rounded-lg">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              অ্যাডমিন ইমেইল
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@studyonlinebd.com"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            loading={loading}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            অ্যাডমিন লগইন
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs text-gray-400 hover:text-emerald-400 transition-colors"
          >
            ← পাবলিক ওয়েবসাইটে ফিরে যান
          </a>
        </div>
      </div>
    </div>
  );
};
