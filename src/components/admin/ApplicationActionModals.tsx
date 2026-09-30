import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Spinner } from '../common/Spinner';
import { JobApplication, CandidateProfile } from '../../types';
import { UploadCloud, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  appId: string;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  appId,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    await onConfirm(reason.trim());
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`আবেদন বাতিল (${appId})`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-gray-600">
          প্রার্থীর আবেদনটি বাতিল করার কারণ লিখুন। এই বার্তাটি প্রার্থীর নোটিফিকেশনে পাঠানো হবে:
        </p>
        <textarea
          rows={3}
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="যেমন: ভুল Transaction ID বা অপর্যাপ্ত টাকা পাঠানো হয়েছে..."
          className="w-full p-3 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-rose-500"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            ফিরে যান
          </Button>
          <Button type="submit" variant="danger" size="sm" loading={loading}>
            বাতিল নিশ্চিত করুন
          </Button>
        </div>
      </form>
    </Modal>
  );
};

interface UploadSoftCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  appId: string;
}

export const UploadSoftCopyModal: React.FC<UploadSoftCopyModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  appId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    await onUpload(file);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`সফট কপি PDF আপলোড (${appId})`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-gray-600">
          Teletalk পোর্টালে ফর্ম পূরণের পর প্রাপ্ত সফট কপি PDF বা স্ক্যান কপি আপলোড করুন। এটি প্রার্থীর কাছে রিভিউ (Check Application)-এর জন্য যাবে।
        </p>
        <input
          type="file"
          accept="application/pdf,image/*"
          required
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-xs file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-sky-50 file:text-sky-700"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            বাতিল
          </Button>
          <Button type="submit" size="sm" loading={loading} disabled={!file}>
            আপলোড ও সেভ করুন
          </Button>
        </div>
      </form>
    </Modal>
  );
};

interface CompletePaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadPaid: (file: File) => Promise<void>;
  appId: string;
}

export const CompletePaidModal: React.FC<CompletePaidModalProps> = ({
  isOpen,
  onClose,
  onUploadPaid,
  appId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    await onUploadPaid(file);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`আবেদন সম্পন্ন ও পেইড কপি আপলোড (${appId})`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900">
          <span className="font-bold block mb-0.5">টেলিটক ফি পরিশোধ নিশ্চিত করুন:</span>
          <span>সরকারি ফি পরিশোধের পর প্রাপ্ত অফিসিয়াল পেইড কপি PDF আপলোড করুন। সম্পন্ন হলে পুরনো অস্থায়ী সফট কপি স্বয়ংক্রিয়ভাবে মুছে যাবে।</span>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            পেইড কপি PDF (বাধ্যতামূলক) <span className="text-rose-500">*</span>
          </label>
          <input
            type="file"
            accept="application/pdf,image/*"
            required
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-xs file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-emerald-50 file:text-emerald-700"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            বাতিল
          </Button>
          <Button type="submit" variant="success" size="sm" loading={loading} disabled={!file}>
            সম্পন্ন করুন (Mark Applied)
          </Button>
        </div>
      </form>
    </Modal>
  );
};

interface AutofillModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: JobApplication | null;
  profile: CandidateProfile | null;
}

export const AutofillModal: React.FC<AutofillModalProps> = ({
  isOpen,
  onClose,
  app,
  profile,
}) => {
  const [copied, setCopied] = useState(false);

  if (!app || !profile) return null;

  const autofillPayload = {
    appId: app.id,
    postName: app.postName,
    educationLevel: app.educationLevel,
    smsNumber: app.smsNumber,
    ...profile.data,
    photoUrl: profile.photoUrl,
    signatureUrl: profile.signatureUrl,
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(autofillPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`অটোফিল ডাটা: ${app.fullName} (${app.id})`}>
      <div className="space-y-4">
        <p className="text-xs text-gray-600">
          টেলিটক পোর্টালে ফর্ম পূরণের জন্য প্রার্থীর সকল ক্যানোনিকাল ডাটা নিচে প্রস্তুত রয়েছে। এক্সটেনশন বা ক্লিপবোর্ডে কপি করে ১-ক্লিকে পূরণ করতে পারেন:
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div><span className="text-gray-400">নাম:</span> <strong>{profile.data?.fullName}</strong></div>
          <div><span className="text-gray-400">বাংলায়:</span> <strong>{profile.data?.nameBn}</strong></div>
          <div><span className="text-gray-400">পিতা:</span> <strong>{profile.data?.fatherName}</strong></div>
          <div><span className="text-gray-400">মাতা:</span> <strong>{profile.data?.motherName}</strong></div>
          <div><span className="text-gray-400">মোবাইল:</span> <strong>{app.smsNumber}</strong></div>
          <div><span className="text-gray-400">NID:</span> <strong>{profile.data?.nidNo}</strong></div>
          <div><span className="text-gray-400">জেলা:</span> <strong>{profile.data?.permanentDistrict}</strong></div>
          <div><span className="text-gray-400">উপজেলা:</span> <strong>{profile.data?.permanentUpazila}</strong></div>
        </div>

        <div className="flex justify-between items-center pt-2">
          {profile.photoUrl && (
            <a href={profile.photoUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-700 underline font-semibold">
              ছবি লিংক ↗
            </a>
          )}
          {profile.signatureUrl && (
            <a href={profile.signatureUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-700 underline font-semibold">
              স্বাক্ষর লিংক ↗
            </a>
          )}
          <Button size="sm" onClick={handleCopyJSON} icon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}>
            {copied ? 'কপি হয়েছে' : 'সকল ডাটা কপি করুন (JSON)'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
