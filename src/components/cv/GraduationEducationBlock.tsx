import React, { useState } from 'react';
import { ProfileData } from '../../types';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import {
  DEGREE_RESULT_TYPES,
  BACHELOR_EXAM_TYPES,
  BACHELOR_SUBJECTS,
  MASTERS_EXAM_TYPES,
  MASTERS_SUBJECTS,
} from '../../data/education';

interface Props {
  formData: Partial<ProfileData>;
  onChange: (field: keyof ProfileData, val: any) => void;
  passingYears: string[];
}

export const GraduationEducationBlock: React.FC<Props> = ({ formData, onChange, passingYears }) => {
  return (
    <div className="pt-4 border-t border-gray-100 space-y-3">
      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
        স্নাতক / অনার্স বা ডিগ্রি (Graduation / Bachelor)
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Select
          label="ডিগ্রির নাম (Examination)"
          value={formData.graExam || ''}
          onChange={(e) => onChange('graExam', e.target.value)}
          options={BACHELOR_EXAM_TYPES.map((b) => ({ value: b.name, label: b.name }))}
        />

        <Select
          label="বিষয় / সাবজেক্ট (Subject)"
          value={formData.graSubject || ''}
          onChange={(e) => onChange('graSubject', e.target.value)}
          options={BACHELOR_SUBJECTS.map((s) => ({ value: s.name, label: s.name }))}
        />

        <Input
          label="বিশ্ববিদ্যালয় / কলেজ / প্রতিষ্ঠান (Institute)"
          placeholder="National University / Dhaka University"
          value={formData.graInstitute || ''}
          onChange={(e) => onChange('graInstitute', e.target.value)}
        />

        <Select
          label="ফলাফলের ধরন (Result Type)"
          value={formData.graResultType || ''}
          onChange={(e) => onChange('graResultType', e.target.value)}
          options={DEGREE_RESULT_TYPES.map((r) => ({ value: r.name, label: r.name }))}
        />

        <Input
          label="ফলাফল / সিজিপিএ (Result / CGPA)"
          placeholder="e.g. 3.45"
          value={formData.graResult || ''}
          onChange={(e) => onChange('graResult', e.target.value)}
        />

        <Select
          label="পাসের সন (Passing Year)"
          value={formData.graYear || ''}
          onChange={(e) => onChange('graYear', e.target.value)}
          options={passingYears}
        />

        <Select
          label="কোর্সের মেয়াদ (Course Duration)"
          value={formData.graDuration || ''}
          onChange={(e) => onChange('graDuration', e.target.value)}
          options={['4 Years', '3 Years', '5 Years', '2 Years', '1 Year']}
        />
      </div>
    </div>
  );
};

export const MastersEducationBlock: React.FC<Props> = ({ formData, onChange, passingYears }) => {
  const [showMasters, setShowMasters] = useState(Boolean(formData.masExam));

  return (
    <div className="pt-4 border-t border-gray-100 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
          স্নাতকোত্তর / মাস্টার্স (Masters - ঐচ্ছিক)
        </h4>
        <button
          type="button"
          onClick={() => setShowMasters(!showMasters)}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          {showMasters ? '- মাস্টার্স লুকান' : '+ মাস্টার্স যোগ করুন'}
        </button>
      </div>

      {showMasters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in">
          <Select
            label="ডিগ্রির নাম (Examination)"
            value={formData.masExam || ''}
            onChange={(e) => onChange('masExam', e.target.value)}
            options={MASTERS_EXAM_TYPES.map((m) => ({ value: m.name, label: m.name }))}
          />

          <Select
            label="বিষয় / সাবজেক্ট (Subject)"
            value={formData.masSubject || ''}
            onChange={(e) => onChange('masSubject', e.target.value)}
            options={MASTERS_SUBJECTS.map((s) => ({ value: s.name, label: s.name }))}
          />

          <Input
            label="বিশ্ববিদ্যালয় / প্রতিষ্ঠান (Institute)"
            placeholder="e.g. University of Dhaka"
            value={formData.masInstitute || ''}
            onChange={(e) => onChange('masInstitute', e.target.value)}
          />

          <Select
            label="ফলাফলের ধরন (Result Type)"
            value={formData.masResultType || ''}
            onChange={(e) => onChange('masResultType', e.target.value)}
            options={DEGREE_RESULT_TYPES.map((r) => ({ value: r.name, label: r.name }))}
          />

          <Input
            label="ফলাফল / সিজিপিএ (Result / CGPA)"
            placeholder="e.g. 3.60"
            value={formData.masResult || ''}
            onChange={(e) => onChange('masResult', e.target.value)}
          />

          <Select
            label="পাসের সন (Passing Year)"
            value={formData.masYear || ''}
            onChange={(e) => onChange('masYear', e.target.value)}
            options={passingYears}
          />

          <Select
            label="কোর্সের মেয়াদ (Course Duration)"
            value={formData.masDuration || ''}
            onChange={(e) => onChange('masDuration', e.target.value)}
            options={['1 Year', '2 Years']}
          />
        </div>
      )}
    </div>
  );
};
