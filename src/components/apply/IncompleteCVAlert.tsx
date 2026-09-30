import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { CompletenessResult } from '../../utils/cvValidation';
import { AlertCircle, ArrowLeft, FileText } from 'lucide-react';

interface Props {
  completeness: CompletenessResult;
  jobSlugOrId: string;
}

export const IncompleteCVAlert: React.FC<Props> = ({ completeness, jobSlugOrId }) => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl border border-amber-200 shadow-sm space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">
            আপনার সিভি এখনো অসম্পূর্ণ ({completeness.percentage}%)!
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            নিখুঁতভাবে চাকরির আবেদন সম্পন্ন করতে প্রথমে আপনার সিভির নিচের ফিল্ডগুলো সম্পূর্ণ পূরণ করুন:
          </p>
        </div>
      </div>

      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900 space-y-1.5">
        <span className="font-bold block">বাকি থাকা প্রয়োজনীয় তথ্যসমূহ:</span>
        <ul className="list-disc list-inside space-y-1 text-amber-800">
          {completeness.missingFields.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Link to={`/jobs/${jobSlugOrId}`}>
          <Button variant="outline" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
            বিজ্ঞপ্তিতে ফিরুন
          </Button>
        </Link>
        <Link to="/cv">
          <Button size="sm" icon={<FileText className="w-3.5 h-3.5" />}>
            আমার সিভি সম্পূর্ণ করুন
          </Button>
        </Link>
      </div>
    </div>
  );
};
