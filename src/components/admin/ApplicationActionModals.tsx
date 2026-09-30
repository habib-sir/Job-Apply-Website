import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Spinner } from '../common/Spinner';
import { JobApplication, CandidateProfile } from '../../types';
import {
  saveFile,
  getFile,
  deleteFile,
  getFileId,
  readPdfAsDataUrl,
  isValidDriveUrl,
  FILE_LIMITS,
} from '../../services/files';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  Link as LinkIcon,
  Upload,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

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
  onUpload: (result: { hasFile: boolean; driveUrl?: string }) => Promise<void>;
  app: JobApplication | null;
}

export const UploadSoftCopyModal: React.FC<UploadSoftCopyModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  app,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [driveUrl, setDriveUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [useDriveInput, setUseDriveInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setDriveUrl('');
      setErrorMsg('');
      setUseDriveInput(false);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setErrorMsg('');

    if (selected) {
      if (selected.size > FILE_LIMITS.PDF_RAW) {
        setErrorMsg('PDF ছোট করুন অথবা Google Drive লিংক দিন');
        setUseDriveInput(true);
        setFile(null);
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;
    setErrorMsg('');

    if (useDriveInput || driveUrl) {
      if (!isValidDriveUrl(driveUrl)) {
        setErrorMsg('শুধুমাত্র drive.google.com বা docs.google.com লিংক গ্রহণযোগ্য');
        return;
      }
      setLoading(true);
      try {
        await onUpload({ hasFile: false, driveUrl: driveUrl.trim() });
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'সেভ করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!file) {
      setErrorMsg('অনুগ্রহ করে ফাইল নির্বাচন করুন অথবা ড্রাইভ লিংক দিন');
      return;
    }

    setLoading(true);
    try {
      const readResult = await readPdfAsDataUrl(file);
      await saveFile({
        id: getFileId.softcopy(app.id),
        ownerUid: app.uid,
        kind: 'softcopy',
        appId: app.id,
        mime: file.type || 'application/pdf',
        sizeBytes: readResult.sizeBytes,
        data: readResult.dataUrl,
      });

      await onUpload({ hasFile: true });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'সফট কপি সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`সফট কপি সরবরাহ (${app?.id || ''})`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-gray-600 leading-relaxed">
          Teletalk পোর্টালে ফর্ম পূরণের পর প্রাপ্ত সফট কপি PDF (সর্বোচ্চ ৬৫০ KB) আপলোড করুন অথবা গুগল ড্রাইভ লিংক দিন।
        </p>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              সফট কপি ফাইল আপলোড (PDF/Image, সর্বোচ্চ ৬৫০ KB)
            </label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={handleFileChange}
              disabled={loading}
              className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-sky-50 file:text-sky-700"
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700">
                অথবা Google Drive লিংক দিন:
              </label>
              {!useDriveInput && (
                <button
                  type="button"
                  onClick={() => setUseDriveInput(true)}
                  className="text-[11px] text-emerald-700 font-semibold hover:underline"
                >
                  ড্রাইভ লিংক ইনপুট দেখান
                </button>
              )}
            </div>

            {(useDriveInput || driveUrl) && (
              <Input
                label=""
                placeholder="https://drive.google.com/file/d/.../view"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                helperText="শুধুমাত্র drive.google.com বা docs.google.com শেয়ারেবল লিংক দিন"
              />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            বাতিল
          </Button>
          <Button type="submit" size="sm" loading={loading} disabled={!file && !driveUrl}>
            সংরক্ষণ ও প্রার্থীকে পাঠান
          </Button>
        </div>
      </form>
    </Modal>
  );
};

interface CompletePaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadPaid: (result: { hasFile: boolean; driveUrl?: string }) => Promise<void>;
  app: JobApplication | null;
}

export const CompletePaidModal: React.FC<CompletePaidModalProps> = ({
  isOpen,
  onClose,
  onUploadPaid,
  app,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [driveUrl, setDriveUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [useDriveInput, setUseDriveInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setDriveUrl('');
      setErrorMsg('');
      setUseDriveInput(false);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setErrorMsg('');

    if (selected) {
      if (selected.size > FILE_LIMITS.PDF_RAW) {
        setErrorMsg('PDF ছোট করুন অথবা Google Drive লিংক দিন');
        setUseDriveInput(true);
        setFile(null);
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;
    setErrorMsg('');

    if (useDriveInput || driveUrl) {
      if (!isValidDriveUrl(driveUrl)) {
        setErrorMsg('শুধুমাত্র drive.google.com বা docs.google.com লিংক গ্রহণযোগ্য');
        return;
      }
      setLoading(true);
      try {
        // Delete temporary soft copy file
        try {
          await deleteFile(getFileId.softcopy(app.id));
        } catch (e) {
          // Ignore
        }

        await onUploadPaid({ hasFile: false, driveUrl: driveUrl.trim() });
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'সেভ করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!file) {
      setErrorMsg('অনুগ্রহ করে পেইড কপি ফাইল আপলোড করুন অথবা ড্রাইভ লিংক দিন');
      return;
    }

    setLoading(true);
    try {
      const readResult = await readPdfAsDataUrl(file);

      // Save paid copy to files/{appId}_paid
      await saveFile({
        id: getFileId.paidcopy(app.id),
        ownerUid: app.uid,
        kind: 'paidcopy',
        appId: app.id,
        mime: file.type || 'application/pdf',
        sizeBytes: readResult.sizeBytes,
        data: readResult.dataUrl,
      });

      // Strict rule: paid কপি সেভ হলে {appId}_soft ডকুমেন্ট মুছবে
      try {
        await deleteFile(getFileId.softcopy(app.id));
      } catch (e) {
        // Non-fatal if soft copy did not exist
      }

      await onUploadPaid({ hasFile: true });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'পেইড কপি সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`আবেদন সম্পন্ন ও পেইড কপি প্রদান (${app?.id || ''})`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
          <span className="font-bold block">টেলিটক ফি পরিশোধ নিশ্চিত করুন:</span>
          <span>সরকারি ফি পরিশোধের পর প্রাপ্ত অফিসিয়াল পেইড কপি PDF (≤650 KB) আপলোড করুন অথবা গুগল ড্রাইভ লিংক দিন। পেইড কপি সেভ হওয়ার পর আগের অস্থায়ী সফট কপি ডকুমেন্ট স্বয়ংক্রিয়ভাবে মুছে যাবে।</span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              পেইড কপি PDF (বাধ্যতামূলক, সর্বোচ্চ ৬৫০ KB) <span className="text-rose-500">*</span>
            </label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={handleFileChange}
              disabled={loading}
              className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-emerald-50 file:text-emerald-700"
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700">
                অথবা Google Drive লিংক দিন:
              </label>
              {!useDriveInput && (
                <button
                  type="button"
                  onClick={() => setUseDriveInput(true)}
                  className="text-[11px] text-emerald-700 font-semibold hover:underline"
                >
                  ড্রাইভ লিংক ইনপুট দেখান
                </button>
              )}
            </div>

            {(useDriveInput || driveUrl) && (
              <Input
                label=""
                placeholder="https://drive.google.com/file/d/.../view"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                helperText="শুধুমাত্র drive.google.com বা docs.google.com শেয়ারেবল লিংক দিন"
              />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            বাতিল
          </Button>
          <Button type="submit" variant="success" size="sm" loading={loading} disabled={!file && !driveUrl}>
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
  const [posted, setPosted] = useState(false);
  const [photoData, setPhotoData] = useState<string>('');
  const [sigData, setSigData] = useState<string>('');
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    if (!isOpen || !app || !profile) return;

    const loadFiles = async () => {
      setLoadingMedia(true);
      try {
        const photoDoc = await getFile(getFileId.photo(app.uid));
        if (photoDoc?.data) setPhotoData(photoDoc.data);

        const sigDoc = await getFile(getFileId.signature(app.uid));
        if (sigDoc?.data) setSigData(sigDoc.data);
      } catch (e) {
        // Fallback
      } finally {
        setLoadingMedia(false);
      }
    };
    loadFiles();
  }, [isOpen, app, profile]);

  if (!app || !profile) return null;

  const autofillPayload = {
    appId: app.id,
    postName: app.postName,
    educationLevel: app.educationLevel,
    smsNumber: app.smsNumber,
    ...profile.data,
    photoDataUrl: photoData || undefined,
    signatureDataUrl: sigData || undefined,
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(autofillPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendPostMessage = () => {
    window.postMessage(
      {
        type: 'TELE_AUTOFILL_DATA',
        source: 'CAREER_PORTAL_ADMIN',
        payload: autofillPayload,
      },
      '*'
    );
    setPosted(true);
    setTimeout(() => setPosted(false), 2500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`অটোফিল ডাটা: ${app.fullName} (${app.id})`}>
      <div className="space-y-4">
        <p className="text-xs text-gray-600">
          টেলিটক পোর্টালে ফর্ম পূরণের জন্য প্রার্থীর সকল ক্যানোনিকাল ডাটা নিচে প্রস্তুত রয়েছে। এক্সটেনশনে পাঠাতে "Autofill-এ পাঠান" চাপুন অথবা JSON কপি করুন:
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

        {/* Loaded Photo & Signature preview using getFile */}
        <div className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-around gap-4">
          <div className="text-center">
            <span className="text-[10px] text-gray-500 block mb-1">প্রার্থীর ছবি (getFile)</span>
            {loadingMedia ? (
              <Spinner size="sm" />
            ) : photoData ? (
              <img src={photoData} alt="Photo" className="w-16 h-16 object-cover rounded border border-gray-300 mx-auto" />
            ) : (
              <span className="text-[10px] text-gray-400">ছবি পাওয়া যায়নি</span>
            )}
          </div>

          <div className="text-center">
            <span className="text-[10px] text-gray-500 block mb-1">স্বাক্ষর (getFile)</span>
            {loadingMedia ? (
              <Spinner size="sm" />
            ) : sigData ? (
              <img src={sigData} alt="Signature" className="h-10 w-24 object-contain rounded border border-gray-300 mx-auto bg-white" />
            ) : (
              <span className="text-[10px] text-gray-400">স্বাক্ষর পাওয়া যায়নি</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <Button
            size="sm"
            onClick={handleSendPostMessage}
            icon={posted ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
          >
            {posted ? 'Autofill-এ পাঠানো হয়েছে ✓' : 'Autofill-এ পাঠান (postMessage)'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyJSON}
            icon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'কপি হয়েছে' : 'JSON কপি'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
