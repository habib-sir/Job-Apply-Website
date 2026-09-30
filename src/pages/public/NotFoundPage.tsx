import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { AlertTriangle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">৪০৪</h1>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</h2>
      <p className="text-xs text-gray-500 max-w-sm mb-6">
        আপনি যে লিংকটিতে প্রবেশের চেষ্টা করেছেন তা হয়তো সরানো হয়েছে বা ঠিকানা ভুল হতে পারে।
      </p>
      <Link to="/">
        <Button>হোম পেজে ফিরে যান</Button>
      </Link>
    </div>
  );
};
