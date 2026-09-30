import React, { useMemo } from 'react';
import { ProfileData } from '../../types';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { BD_DISTRICTS } from '../../data/districts';
import { QUOTA_CATEGORIES, DEPENDENCY_STATUSES } from '../../data/education';
import { isValidMobile } from '../../utils/auth';
import { isValidEmail } from '../../utils/cvValidation';

interface Props {
  formData: Partial<ProfileData>;
  onChange: (field: keyof ProfileData, val: any) => void;
  onMultipleChange: (updates: Partial<ProfileData>) => void;
}

export const ContactAddressSection: React.FC<Props> = ({
  formData,
  onChange,
  onMultipleChange,
}) => {
  // Cascaded upazilas for present district
  const presentUpazilas = useMemo(() => {
    const dist = BD_DISTRICTS.find((d) => d.name === formData.presentDistrict);
    return dist ? dist.upazilas.map((u) => ({ value: u.name, label: u.name })) : [];
  }, [formData.presentDistrict]);

  // Cascaded upazilas for permanent district
  const permanentUpazilas = useMemo(() => {
    const dist = BD_DISTRICTS.find((d) => d.name === formData.permanentDistrict);
    return dist ? dist.upazilas.map((u) => ({ value: u.name, label: u.name })) : [];
  }, [formData.permanentDistrict]);

  const districtOptions = useMemo(
    () => BD_DISTRICTS.map((d) => ({ value: d.name, label: d.name })),
    []
  );

  const quotaOptions = useMemo(
    () => QUOTA_CATEGORIES.map((q) => ({ value: q.name, label: q.name })),
    []
  );

  const depOptions = useMemo(
    () => DEPENDENCY_STATUSES.map((ds) => ({ value: ds.name, label: ds.name })),
    []
  );

  const handleSameAsPresentChange = (checked: boolean) => {
    if (checked) {
      onMultipleChange({
        sameAsPresent: true,
        permanentCareOf: formData.presentCareOf,
        permanentAddress: formData.presentAddress,
        permanentDistrict: formData.presentDistrict,
        permanentUpazila: formData.presentUpazila,
        permanentPost: formData.presentPost,
        permanentPostcode: formData.presentPostcode,
      });
    } else {
      onChange('sameAsPresent', false);
    }
  };

  const handlePresentDistrictChange = (distName: string) => {
    const updates: Partial<ProfileData> = {
      presentDistrict: distName,
      presentUpazila: '',
    };
    if (formData.sameAsPresent) {
      updates.permanentDistrict = distName;
      updates.permanentUpazila = '';
    }
    onMultipleChange(updates);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">
      <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
        ৩. যোগাযোগ ও ঠিকানা সংক্রান্ত তথ্য (Contact & Address)
      </h3>

      {/* Contact Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Input
          label="মোবাইল নম্বর (Mobile No)"
          placeholder="017XXXXXXXX"
          value={formData.mobile || ''}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            onChange('mobile', val);
          }}
          error={formData.mobile && !isValidMobile(formData.mobile) ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন' : undefined}
          maxLength={11}
          requiredStar
        />

        <Input
          label="মোবাইল নম্বর নিশ্চিত করুন (Confirm Mobile)"
          placeholder="017XXXXXXXX"
          value={formData.mobileConfirm || ''}
          onChange={(e) => onChange('mobileConfirm', e.target.value.replace(/\D/g, ''))}
          error={formData.mobileConfirm && formData.mobile !== formData.mobileConfirm ? 'মোবাইল নম্বর দুটি মিলছে না' : undefined}
          maxLength={11}
          requiredStar
        />

        <Input
          label="ইমেইল এড্রেস (Email Address)"
          type="email"
          placeholder="example@mail.com"
          value={formData.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          error={formData.email && !isValidEmail(formData.email) ? 'সঠিক ইমেইল ফরম্যাট দিন' : undefined}
          requiredStar
        />

        <Select
          label="কোটা (Quota)"
          value={formData.quota || 'Non Quota'}
          onChange={(e) => onChange('quota', e.target.value)}
          options={quotaOptions}
          requiredStar
        />

        <Select
          label="বিভাগীয় প্রার্থীর স্ট্যাটাস (Departmental Status)"
          value={formData.depStatus || ''}
          onChange={(e) => onChange('depStatus', e.target.value)}
          options={depOptions}
          placeholder="প্রযোজ্য নয়"
        />
      </div>

      {/* Present Address */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
          বর্তমান ঠিকানা (Present Address)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            label="কার অফ (Care Of / অভিভাবক)"
            placeholder="MD. FATHER NAME"
            value={formData.presentCareOf || ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange('presentCareOf', val);
              if (formData.sameAsPresent) onChange('permanentCareOf', val);
            }}
            requiredStar
          />

          <Input
            label="গ্রাম / রাস্তা / বাসা (Village/Road/House)"
            placeholder="House #12, Road #4, Sector #1"
            value={formData.presentAddress || ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange('presentAddress', val);
              if (formData.sameAsPresent) onChange('permanentAddress', val);
            }}
            requiredStar
          />

          <Select
            label="জেলা (District)"
            value={formData.presentDistrict || ''}
            onChange={(e) => handlePresentDistrictChange(e.target.value)}
            options={districtOptions}
            requiredStar
          />

          <Select
            label="উপজেলা (Upazila)"
            value={formData.presentUpazila || ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange('presentUpazila', val);
              if (formData.sameAsPresent) onChange('permanentUpazila', val);
            }}
            options={presentUpazilas}
            disabled={!formData.presentDistrict}
            placeholder={formData.presentDistrict ? 'উপজেলা নির্বাচন করুন' : 'আগে জেলা নির্বাচন করুন'}
            requiredStar
          />

          <Input
            label="ডাকঘর (Post Office)"
            placeholder="Post Office Name"
            value={formData.presentPost || ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange('presentPost', val);
              if (formData.sameAsPresent) onChange('permanentPost', val);
            }}
            requiredStar
          />

          <Input
            label="পোস্ট কোড (Postcode)"
            placeholder="1205"
            value={formData.presentPostcode || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              onChange('presentPostcode', val);
              if (formData.sameAsPresent) onChange('permanentPostcode', val);
            }}
            maxLength={6}
            requiredStar
          />
        </div>
      </div>

      {/* Permanent Address */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            স্থায়ী ঠিকানা (Permanent Address)
          </h4>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              checked={Boolean(formData.sameAsPresent)}
              onChange={(e) => handleSameAsPresentChange(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <span>বর্তমান ঠিকানার মতোই (Same as Present)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            label="কার অফ (Care Of / অভিভাবক)"
            placeholder="MD. FATHER NAME"
            value={formData.permanentCareOf || ''}
            onChange={(e) => onChange('permanentCareOf', e.target.value)}
            disabled={formData.sameAsPresent}
            requiredStar
          />

          <Input
            label="গ্রাম / রাস্তা / বাসা (Village/Road/House)"
            placeholder="House #12, Road #4"
            value={formData.permanentAddress || ''}
            onChange={(e) => onChange('permanentAddress', e.target.value)}
            disabled={formData.sameAsPresent}
            requiredStar
          />

          <Select
            label="জেলা (District)"
            value={formData.permanentDistrict || ''}
            onChange={(e) => {
              onMultipleChange({
                permanentDistrict: e.target.value,
                permanentUpazila: '',
              });
            }}
            options={districtOptions}
            disabled={formData.sameAsPresent}
            requiredStar
          />

          <Select
            label="উপজেলা (Upazila)"
            value={formData.permanentUpazila || ''}
            onChange={(e) => onChange('permanentUpazila', e.target.value)}
            options={permanentUpazilas}
            disabled={formData.sameAsPresent || !formData.permanentDistrict}
            placeholder={formData.permanentDistrict ? 'উপজেলা নির্বাচন করুন' : 'আগে জেলা নির্বাচন করুন'}
            requiredStar
          />

          <Input
            label="ডাকঘর (Post Office)"
            placeholder="Post Office Name"
            value={formData.permanentPost || ''}
            onChange={(e) => onChange('permanentPost', e.target.value)}
            disabled={formData.sameAsPresent}
            requiredStar
          />

          <Input
            label="পোস্ট কোড (Postcode)"
            placeholder="1205"
            value={formData.permanentPostcode || ''}
            onChange={(e) => onChange('permanentPostcode', e.target.value.replace(/\D/g, ''))}
            disabled={formData.sameAsPresent}
            maxLength={6}
            requiredStar
          />
        </div>
      </div>
    </div>
  );
};
