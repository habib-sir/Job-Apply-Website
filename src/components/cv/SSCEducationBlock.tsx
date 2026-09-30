import React from 'react';
import { ProfileData } from '../../types';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import {
  SSC_EXAM_TYPES,
  SSC_BOARDS,
  SSC_SUBJECT_GROUPS,
  SCHOOL_RESULT_TYPES,
} from '../../data/education';

interface Props {
  formData: Partial<ProfileData>;
  onChange: (field: keyof ProfileData, val: any) => void;
  passingYears: string[];
}

export const SSCEducationBlock: React.FC<Props> = ({ formData, onChange, passingYears }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
        মাধ্যমিক / এস.এস.সি বা সমমান (SSC or Equivalent)
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Select
          label="পরীক্ষার নাম (Examination)"
          value={formData.sscExam || ''}
          onChange={(e) => onChange('sscExam', e.target.value)}
          options={SSC_EXAM_TYPES.map((t) => ({ value: t.name, label: t.name }))}
          requiredStar
        />

        <Input
          label="রোল নম্বর (Roll Number)"
          placeholder="123456"
          value={formData.sscRoll || ''}
          onChange={(e) => onChange('sscRoll', e.target.value.replace(/\D/g, ''))}
          maxLength={10}
          requiredStar
        />

        <Select
          label="বিভাগ / গ্রুপ (Group / Subject)"
          value={formData.sscGroup || ''}
          onChange={(e) => onChange('sscGroup', e.target.value)}
          options={SSC_SUBJECT_GROUPS.map((g) => ({ value: g.name, label: g.name }))}
          requiredStar
        />

        {formData.sscGroup === 'Others' && (
          <Input
            label="অন্যান্য গ্রুপের নাম"
            placeholder="গ্রুপের নাম লিখুন"
            value={formData.sscGroupOther || ''}
            onChange={(e) => onChange('sscGroupOther', e.target.value)}
            requiredStar
          />
        )}

        <Select
          label="বোর্ড (Board)"
          value={formData.sscBoard || ''}
          onChange={(e) => onChange('sscBoard', e.target.value)}
          options={SSC_BOARDS.map((b) => ({ value: b.name, label: b.name }))}
          requiredStar
        />

        {formData.sscBoard === 'Others' && (
          <Input
            label="অন্যান্য বোর্ডের নাম"
            placeholder="বোর্ডের নাম লিখুন"
            value={formData.sscBoardOther || ''}
            onChange={(e) => onChange('sscBoardOther', e.target.value)}
            requiredStar
          />
        )}

        <Select
          label="ফলাফলের ধরন (Result Type)"
          value={formData.sscResultType || ''}
          onChange={(e) => onChange('sscResultType', e.target.value)}
          options={SCHOOL_RESULT_TYPES.map((r) => ({ value: r.name, label: r.name }))}
          requiredStar
        />

        <Input
          label="ফলাফল / জিপিএ (Result / GPA)"
          placeholder="e.g. 5.00"
          value={formData.sscResult || ''}
          onChange={(e) => onChange('sscResult', e.target.value)}
          requiredStar
        />

        <Select
          label="পাসের সন (Passing Year)"
          value={formData.sscYear || ''}
          onChange={(e) => onChange('sscYear', e.target.value)}
          options={passingYears}
          requiredStar
        />
      </div>
    </div>
  );
};
