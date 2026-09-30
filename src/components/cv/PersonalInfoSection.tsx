import React from 'react';
import { ProfileData } from '../../types';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { isValidDateOfBirth } from '../../utils/cvValidation';

interface Props {
  formData: Partial<ProfileData>;
  onChange: (field: keyof ProfileData, val: any) => void;
}

export const PersonalInfoSection: React.FC<Props> = ({ formData, onChange }) => {
  const dobValidation = formData.dateOfBirth ? isValidDateOfBirth(formData.dateOfBirth) : { valid: true };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
        ১. ব্যক্তিগত তথ্য (Personal Information)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Input
          label="প্রার্থীর পূর্ণ নাম (English Capital)"
          placeholder="MD. RAHIM MIA"
          value={formData.fullName || ''}
          onChange={(e) => {
            const val = e.target.value.toUpperCase();
            onChange('fullName', val);
            onChange('name', val);
          }}
          requiredStar
        />

        <Input
          label="প্রার্থীর নাম (বাংলায়)"
          placeholder="মোঃ রহিম মিয়া"
          value={formData.nameBn || ''}
          onChange={(e) => onChange('nameBn', e.target.value)}
          requiredStar
        />

        <Input
          label="পিতার নাম (English Capital)"
          placeholder="MD. KARIM MIA"
          value={formData.fatherName || ''}
          onChange={(e) => onChange('fatherName', e.target.value.toUpperCase())}
          requiredStar
        />

        <Input
          label="পিতার নাম (বাংলায়)"
          placeholder="মোঃ করিম মিয়া"
          value={formData.fatherBn || ''}
          onChange={(e) => onChange('fatherBn', e.target.value)}
        />

        <Input
          label="মাতার নাম (English Capital)"
          placeholder="FATEMA BEGUM"
          value={formData.motherName || ''}
          onChange={(e) => onChange('motherName', e.target.value.toUpperCase())}
          requiredStar
        />

        <Input
          label="মাতার নাম (বাংলায়)"
          placeholder="ফাতেমা বেগম"
          value={formData.motherBn || ''}
          onChange={(e) => onChange('motherBn', e.target.value)}
        />

        <Input
          label="জন্মতারিখ (Date of Birth)"
          type="date"
          value={formData.dateOfBirth || ''}
          onChange={(e) => onChange('dateOfBirth', e.target.value)}
          error={!dobValidation.valid ? dobValidation.message : undefined}
          requiredStar
        />

        <Select
          label="লিঙ্গ (Gender)"
          value={formData.gender || ''}
          onChange={(e) => onChange('gender', e.target.value)}
          options={[
            { value: 'Male', label: 'পুরুষ (Male)' },
            { value: 'Female', label: 'মহিলা (Female)' },
            { value: 'Other', label: 'অন্যান্য (Other)' },
          ]}
          requiredStar
        />

        <Select
          label="ধর্ম (Religion)"
          value={formData.religion || ''}
          onChange={(e) => onChange('religion', e.target.value)}
          options={[
            { value: 'Islam', label: 'ইসলাম (Islam)' },
            { value: 'Hinduism', label: 'হিন্দুধর্ম (Hinduism)' },
            { value: 'Buddhism', label: 'বৌদ্ধধর্ম (Buddhism)' },
            { value: 'Christianity', label: 'খ্রিস্টধর্ম (Christianity)' },
            { value: 'Others', label: 'অন্যান্য (Others)' },
          ]}
          requiredStar
        />

        <Select
          label="বৈবাহিক অবস্থা (Marital Status)"
          value={formData.maritalStatus || ''}
          onChange={(e) => onChange('maritalStatus', e.target.value)}
          options={[
            { value: 'Single', label: 'অবিবাহিত (Single)' },
            { value: 'Married', label: 'বিবাহিত (Married)' },
          ]}
          requiredStar
        />

        {formData.maritalStatus === 'Married' && (
          <Input
            label="স্বামী / স্ত্রীর নাম (Spouse Name)"
            placeholder="SPOUSE FULL NAME"
            value={formData.spouseName || ''}
            onChange={(e) => onChange('spouseName', e.target.value.toUpperCase())}
          />
        )}

        <Select
          label="রক্তের গ্রুপ (Blood Group)"
          value={formData.bloodGroup || ''}
          onChange={(e) => onChange('bloodGroup', e.target.value)}
          options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
        />

        <Input
          label="পিতার পেশা (Father's Occupation)"
          placeholder="Farmer / Teacher / Businessman"
          value={formData.fatherOccupation || ''}
          onChange={(e) => onChange('fatherOccupation', e.target.value)}
        />
      </div>
    </div>
  );
};
