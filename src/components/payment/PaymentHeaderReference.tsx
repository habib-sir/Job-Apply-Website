import React from 'react';
import { Copy, Check } from 'lucide-react';

interface Props {
  appId: string;
  jobTitle: string;
  postName: string;
  fee: {
    applicationFee: number;
    serviceCharge: number;
    total: number;
  };
  onCopy: (text: string, type: string) => void;
  copiedText: string | null;
}

export const PaymentHeaderReference: React.FC<Props> = ({
  appId,
  jobTitle,
  postName,
  fee,
  onCopy,
  copiedText,
}) => {
  return (
    <>
      <div>
        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
          ধাপ ২: পেমেন্ট ও TrxID প্রদান
        </span>
        <h1 className="text-xl font-bold text-gray-900">সার্ভিস ফি ও সরকারি ফি পরিশোধ</h1>
        <p className="text-xs text-gray-500 mt-1">
          আবেদন: {jobTitle} • পদ: {postName}
        </p>
      </div>

      {/* Big Reference Card */}
      <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl text-center space-y-2 shadow-sm">
        <span className="text-xs font-medium text-emerald-200 uppercase tracking-widest">
          আপনার আবেদন রেফারেন্স আইডি
        </span>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-wider font-mono">
            {appId}
          </span>
          <button
            onClick={() => onCopy(appId, 'appId')}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
            title="কপি করুন"
          >
            {copiedText === 'appId' ? (
              <Check className="w-4 h-4 text-emerald-300" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-[11px] text-emerald-100/90">
          টাকা পাঠানোর সময় bKash/Rocket রেফারেন্সের ঘরে অবশ্যই এই আইডিটি লিখবেন
        </p>
      </div>

      {/* Total Fee breakdown */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
        <div>
          <span className="text-[11px] text-gray-500 block">সরকারি ফি</span>
          <span className="text-sm font-bold text-gray-900">৳{fee?.applicationFee}</span>
        </div>
        <div>
          <span className="text-[11px] text-gray-500 block">সার্ভিস চার্জ</span>
          <span className="text-sm font-bold text-gray-900">৳{fee?.serviceCharge}</span>
        </div>
        <div className="border-l border-gray-200">
          <span className="text-[11px] text-emerald-700 font-bold block">মোট প্রদেয়</span>
          <span className="text-base font-extrabold text-emerald-700">৳{fee?.total}</span>
        </div>
      </div>
    </>
  );
};
