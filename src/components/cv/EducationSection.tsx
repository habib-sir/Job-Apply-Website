import React from 'react';
import { ProfileData } from '../../types';
import { SSCEducationBlock } from './SSCEducationBlock';
import { HSCEducationBlock } from './HSCEducationBlock';
import { GraduationEducationBlock, MastersEducationBlock } from './GraduationEducationBlock';

interface Props {
  formData: Partial<ProfileData>;
  onChange: (field: keyof ProfileData, val: any) => void;
}

export const EducationSection: React.FC<Props> = ({ formData, onChange }) => {
  const currentYear = new Date().getFullYear();
  const passingYears = Array.from({ length: 45 }, (_, i) => String(currentYear - i));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">
      <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
        ৪. শিক্ষাগত যোগ্যতা সংক্রান্ত তথ্য (Educational Qualifications)
      </h3>

      <SSCEducationBlock formData={formData} onChange={onChange} passingYears={passingYears} />
      <HSCEducationBlock formData={formData} onChange={onChange} passingYears={passingYears} />
      <GraduationEducationBlock formData={formData} onChange={onChange} passingYears={passingYears} />
      <MastersEducationBlock formData={formData} onChange={onChange} passingYears={passingYears} />
    </div>
  );
};
