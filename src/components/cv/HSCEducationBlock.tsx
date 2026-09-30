import React from 'react';
import { ProfileData } from '../../types';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import {
  HSC_EXAM_TYPES,
  HSC_BOARDS,
  HSC_SUBJECT_GROUPS,
  SCHOOL_RESULT_TYPES,
} from '../../data/education';

interface Props {
  formData: Partial<ProfileData>;
  onChange: (field: keyof ProfileData, val: any) => void;
  passingYears: string[];
}

export const HSCEducationBlock: React.FC<Props> = ({ formData, onChange, passingYears }) => {
  return (
    <div className="pt-4 border-t border-gray-100 space-y-3">
      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
        উচ্চ মাধ্যমিক / এইচ.এস.সি বা সমমান (HSC or Equivalent)
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Select
          label="পরীক্ষার নাম (Examination)"
          value={formData.hscExam || ''}
          onChange={(e) => onChange('hscExam', e.target.value)}
          options={HSC_EXAM_TYPES.map((t) => ({ value: t.name, label: t.name }))}
          requiredStar
        />

        <Input
          label="রোল নম্বর (Roll Number)"
          placeholder="123456"
          value={formData.hscRoll || ''}
          onChange={(e) => onChange('hscRoll', e.target.value.replace(/\D/g, ''))}
          maxLength={10}
          requiredStar
        />

        <Select
          label="বিভাগ / গ্রুপ (Group / Subject)"
          value={formData.hscGroup || ''}
          onChange={(e) => onChange('hscGroup', e.target.value)}
          options={HSC_SUBJECT_GROUPS.map((g) => ({ value: g.name, label: g.name }))}
          requiredStar
        />

        {formData.hscGroup === 'Others' && (
          <Input
            label="অন্যান্য গ্রুপের নাম"
            placeholder="গ্রুপের নাম লিখুন"
            value={formData.hscGroupOther || ''}
            onChange={(e) => onChange('hscGroupOther', e.target.value)}
            requiredStar
          />
        )}

        <Select
          label="বোর্ড (Board)"
          value={formData.hscBoard || ''}
          onChange={(e) => onChange('hscBoard', e.target.value)}
          options={HSC_BOARDS.map((b) => ({ value: b.name, label: b.name }))}
          requiredStar
        />

        {formData.hscBoard === 'Others' && (
          <Input
            label="অন্যান্য বোর্ডের নাম"
            placeholder="বোর্ডের নাম লিখুন"
            value={formData.hscBoardOther || ''}
            onChange={(e) => onChange('hscBoardOther', e.target.value)}
            requiredStar
          />
        )}

        <Select
          label="ফলাফলের ধরন (Result Type)"
          value={formData.hscResultType || ''}
          onChange={(e) => onChange('hscResultType', e.target.value)}
          options={SCHOOL_RESULT_TYPES.map((r) => ({ value: r.name, label: r.name }))}
          requiredStar
        />

        <Input
          label="ফলাফল / জিপিএ (Result / GPA)"
          placeholder="e.g. 4.80"
          value={formData.hscResult || ''}
          onChange={(e) => onChange('hscResult', e.target.value)}
          requiredStar
        />

        <Select
          label="পাসের সন (Passing Year)"
          value={formData.hscYear || ''}
          onChange={(e) => onChange('hscYear', e.target.value)}
          options={passingYears}
          requiredStar
        />
      </div>
    </div>
  );
};
