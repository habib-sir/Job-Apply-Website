import React, { useEffect, useState } from 'react';
import { Save, ExternalLink } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { fetchSalaryScaleConfig, putPublicJson } from '../../services/jobsStore';
import { DEFAULT_SALARY_SCALE_CONFIG, SalaryScaleConfig, SalaryScaleOption, formatSalary } from '../../types';
import { useToast } from '../../components/common/Toast';

export const AdminSalaryScalePage: React.FC = () => {
  const { success, error } = useToast();
  const [config, setConfig] = useState<SalaryScaleConfig>(DEFAULT_SALARY_SCALE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSalaryScaleConfig().then(setConfig).finally(() => setLoading(false));
  }, []);

  const updateScale = (index: number, field: keyof SalaryScaleOption, value: string) => {
    setConfig((current) => ({
      ...current,
      scales: current.scales.map((scale, i) => {
        if (i !== index) return scale;
        if (field === 'grade') return { ...scale, grade: value };
        return { ...scale, [field]: value === '' ? undefined : Number(value) };
      }),
    }));
  };

  const handleSave = async () => {
    const scales = config.scales
      .filter((scale) => scale.grade.trim())
      .map((scale) => ({
        grade: scale.grade.trim(),
        ...(scale.minValue != null ? { minValue: Number(scale.minValue) } : {}),
        ...(scale.maxValue != null ? { maxValue: Number(scale.maxValue) } : {}),
      }));
    if (scales.some((scale) => (scale.minValue != null && scale.maxValue != null && scale.minValue > scale.maxValue))) {
      error('কোনো salary scale-এ সর্বনিম্ন বেতন সর্বোচ্চের চেয়ে বেশি হতে পারবে না');
      return;
    }
    setSaving(true);
    try {
      await putPublicJson('salary-scales', {
        version: config.version.trim() || 'জাতীয় বেতন স্কেল ২০২৬',
        sourceUrl: config.sourceUrl?.trim() || DEFAULT_SALARY_SCALE_CONFIG.sourceUrl,
        updatedAt: new Date().toISOString(),
        scales,
      });
      setConfig((current) => ({ ...current, scales, updatedAt: new Date().toISOString() }));
      success('বেতন গ্রেড ও scale সংরক্ষণ হয়েছে। নতুন circular form-এ dropdown-এ আসবে।');
    } catch (err: any) {
      error(err?.message || 'বেতন scale সংরক্ষণ করা যায়নি');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-sm text-gray-500">বেতন scale লোড হচ্ছে...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">বেতন গ্রেড ও স্কেল</h2>
          <p className="text-xs text-gray-500 mt-1">একবার এখানে grade-wise সর্বনিম্ন ও সর্বোচ্চ basic salary দিন। Job form-এ পদভিত্তিক dropdown স্বয়ংক্রিয়ভাবে আপডেট হবে।</p>
        </div>
        <Button onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>Scale সংরক্ষণ করুন</Button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
        <p className="font-bold">Official source ও data policy</p>
        <p>জাতীয় বেতন স্কেল ২০২৬-এর official reference নিচে রাখা হয়েছে। সরকারি গেজেট পরিবর্তন হলে এই তালিকাই edit করে আপডেট করুন। ভুল বা অনুমানভিত্তিক salary বসাবেন না।</p>
        <a className="inline-flex items-center gap-1 underline font-semibold" href={config.sourceUrl || DEFAULT_SALARY_SCALE_CONFIG.sourceUrl} target="_blank" rel="noreferrer">অর্থ বিভাগের official source খুলুন <ExternalLink className="w-3 h-3" /></a>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[70px_1fr_1fr_1fr] gap-3 bg-gray-50 border-b border-gray-200 px-4 py-3 text-xs font-bold text-gray-700">
          <span>#</span><span>গ্রেডের নাম</span><span>সর্বনিম্ন basic (৳)</span><span>সর্বোচ্চ basic (৳)</span>
        </div>
        <div className="divide-y divide-gray-100">
          {config.scales.map((scale, index) => (
            <div key={index} className="grid grid-cols-[70px_1fr_1fr_1fr] gap-3 items-center px-4 py-3">
              <span className="text-sm font-bold text-gray-500">{index + 1}</span>
              <Input value={scale.grade} onChange={(e) => updateScale(index, 'grade', e.target.value)} placeholder={`${index + 1}তম গ্রেড`} />
              <Input type="number" value={scale.minValue ?? ''} onChange={(e) => updateScale(index, 'minValue', e.target.value)} placeholder="যেমন ২০০০০" />
              <Input type="number" value={scale.maxValue ?? ''} onChange={(e) => updateScale(index, 'maxValue', e.target.value)} placeholder="যেমন ৫৬০০০" />
            </div>
          ))}
        </div>
      </div>

      {config.scales.some((scale) => scale.minValue != null || scale.maxValue != null) && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900">
          Preview: {config.scales.filter((scale) => scale.minValue != null || scale.maxValue != null).slice(0, 3).map((scale) => `${scale.grade}: ${formatSalary(scale.minValue)}–${formatSalary(scale.maxValue)} টাকা`).join(' • ')}
        </div>
      )}
    </div>
  );
};
