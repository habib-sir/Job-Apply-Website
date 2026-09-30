import React from 'react';
import { Button } from '../common/Button';
import { CompletenessResult } from '../../utils/cvValidation';
import { Save, Trash2, CheckCircle2 } from 'lucide-react';

interface Props {
  completeness: CompletenessResult;
  saving: boolean;
  onSave: () => void;
  onOpenDeleteModal: () => void;
}

export const CVHeaderCard: React.FC<Props> = ({
  completeness,
  saving,
  onSave,
  onOpenDeleteModal,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">আমার সিভি (My CV)</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            টেলিটক ও সরকারি চাকরির অনলাইন আবেদনের জন্য আপনার নির্ভরযোগ্য জীবনবৃত্তান্ত
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onSave} loading={saving} icon={<Save className="w-4 h-4" />}>
            সিভি সেভ করুন
          </Button>

          <Button
            variant="outline"
            onClick={onOpenDeleteModal}
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
            title="সিভি মুছুন"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Completeness Bar */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-gray-700">সিভি সম্পূর্ণতা:</span>
          <span
            className={`${
              completeness.percentage === 100
                ? 'text-emerald-700'
                : completeness.percentage > 50
                ? 'text-teal-700'
                : 'text-amber-700'
            }`}
          >
            {completeness.percentage}%
          </span>
        </div>

        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              completeness.percentage === 100
                ? 'bg-emerald-600'
                : completeness.percentage > 50
                ? 'bg-teal-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${completeness.percentage}%` }}
          />
        </div>

        {completeness.missingFields.length > 0 ? (
          <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-900 border border-amber-200/60 mt-2">
            <span className="font-semibold block mb-1">
              আবেদনের জন্য এখনও বাকি ফিল্ডসমূহ ({completeness.missingFields.length}টি):
            </span>
            <p className="text-[11px] leading-relaxed text-amber-800">
              {completeness.missingFields.join(' • ')}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>আপনার সিভি ১০০% সম্পূর্ণ! যেকোনো চাকরির জন্য আপনি প্রস্তুত।</span>
          </div>
        )}
      </div>
    </div>
  );
};
