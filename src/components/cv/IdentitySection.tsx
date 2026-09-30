import React from 'react';
import { ProfileData } from '../../types';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { isValidNID } from '../../utils/cvValidation';

interface Props {
  formData: Partial<ProfileData>;
  onChange: (field: keyof ProfileData, val: any) => void;
}

export const IdentitySection: React.FC<Props> = ({ formData, onChange }) => {
  const nidError =
    formData.nidNo && !isValidNID(formData.nidNo)
      ? 'এনআইডি ১০, ১৩ অথবা ১৭ ডিজিটের হতে হবে'
      : undefined;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
        ২. পরিচয়পত্র সংক্রান্ত তথ্য (Identification)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Select
          label="জাতীয় পরিচয়পত্র আছে? (NID Status)"
          value={formData.nidType || 'Yes'}
          onChange={(e) => onChange('nidType', e.target.value)}
          options={[
            { value: 'Yes', label: 'হ্যাঁ (Yes)' },
            { value: 'No', label: 'না (No)' },
          ]}
          requiredStar
        />

        <Input
          label="জাতীয় পরিচয়পত্র নম্বর (NID Number)"
          placeholder="১০, ১৩ বা ১৭ ডিজিট"
          value={formData.nidNo || ''}
          onChange={(e) => onChange('nidNo', e.target.value.replace(/\D/g, ''))}
          error={nidError}
          maxLength={17}
          requiredStar
          helperText="১০, ১৩ বা ১৭ ডিজিটের এনআইডি দিন"
        />

        <Input
          label="জন্ম নিবন্ধন নম্বর (Birth Reg No - ঐচ্ছিক)"
          placeholder="১৭ ডিজিটের জন্ম নিবন্ধন"
          value={formData.birthRegNo || ''}
          onChange={(e) => onChange('birthRegNo', e.target.value.replace(/\D/g, ''))}
          maxLength={17}
        />

        <Input
          label="পাসপোর্ট নম্বর (Passport No - ঐচ্ছিক)"
          placeholder="যেমন: A01234567"
          value={formData.passportNo || ''}
          onChange={(e) => onChange('passportNo', e.target.value.toUpperCase())}
        />
      </div>
    </div>
  );
};
