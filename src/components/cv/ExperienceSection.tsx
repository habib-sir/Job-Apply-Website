import React from 'react';
import { ProfileData, CustomField } from '../../types';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  formData: Partial<ProfileData>;
  onChange: (field: keyof ProfileData, val: any) => void;
}

export const ExperienceSection: React.FC<Props> = ({ formData, onChange }) => {
  const customFields: CustomField[] = formData.customFields || [];

  const handleAddCustomField = () => {
    onChange('customFields', [...customFields, { key: '', value: '' }]);
  };

  const handleUpdateCustomField = (index: number, keyOrVal: 'key' | 'value', value: string) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [keyOrVal]: value };
    onChange('customFields', updated);
  };

  const handleRemoveCustomField = (index: number) => {
    const updated = customFields.filter((_, i) => i !== index);
    onChange('customFields', updated);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">
      <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
        ৫. অভিজ্ঞতা ও অতিরিক্ত তথ্য (Experience & Additional Fields)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="কম্পিউটার চালনা অভিজ্ঞতা (Computer Experience)"
          value={formData.experienceComputer || 'No'}
          onChange={(e) => onChange('experienceComputer', e.target.value)}
          options={[
            { value: 'Yes', label: 'হ্যাঁ (Yes)' },
            { value: 'No', label: 'না (No)' },
          ]}
        />

        <Select
          label="শাঁটলিপি বা সাঁটমুদ্রাক্ষরিক অভিজ্ঞতা (Shorthand / Type Experience)"
          value={formData.experienceSatlipi || 'No'}
          onChange={(e) => onChange('experienceSatlipi', e.target.value)}
          options={[
            { value: 'Yes', label: 'হ্যাঁ (Yes)' },
            { value: 'No', label: 'না (No)' },
          ]}
        />
      </div>

      {/* Custom Fields */}
      <div className="pt-2 border-t border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              অতিরিক্ত কাস্টম ফিল্ড (Custom Fields)
            </h4>
            <p className="text-[11px] text-gray-500">
              বিশেষ কোনো কোটা বা পদের বিশেষ শর্ত থাকলে যোগ করতে পারেন
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCustomField}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            ফিল্ড যোগ করুন
          </Button>
        </div>

        {customFields.length > 0 && (
          <div className="space-y-3 pt-2">
            {customFields.map((field, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Input
                  placeholder="ফিল্ডের নাম (যেমন: ড্রাইভিং লাইসেন্স নং)"
                  value={field.key}
                  onChange={(e) => handleUpdateCustomField(idx, 'key', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="তথ্য / মান (Value)"
                  value={field.value}
                  onChange={(e) => handleUpdateCustomField(idx, 'value', e.target.value)}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(idx)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
