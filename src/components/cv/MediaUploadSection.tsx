import React, { useRef, useState } from 'react';
import { Camera, FileSignature, UploadCloud } from 'lucide-react';
import { Spinner } from '../common/Spinner';
import {
  saveFile,
  getFileId,
  compressImageToDataUrl,
  FILE_LIMITS,
} from '../../services/files';

interface Props {
  uid: string;
  photoUrl?: string;
  signatureUrl?: string;
  onPhotoUploaded: (dataUrl: string) => void;
  onSignatureUploaded: (dataUrl: string) => void;
}

export const MediaUploadSection: React.FC<Props> = ({
  uid,
  photoUrl,
  signatureUrl,
  onPhotoUploaded,
  onSignatureUploaded,
}) => {
  const [photoUploading, setPhotoUploading] = useState(false);
  const [sigUploading, setSigUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [sigError, setSigError] = useState('');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    setPhotoUploading(true);

    try {
      // Auto resize & compress to 300x300, <=100KB JPEG
      const compressed = await compressImageToDataUrl(
        file,
        300,
        300,
        FILE_LIMITS.PHOTO,
        'image/jpeg'
      );

      if (compressed.sizeBytes > FILE_LIMITS.PHOTO) {
        throw new Error('ছবির সাইজ সর্বোচ্চ ১০০ KB হতে পারবে');
      }

      await saveFile({
        id: getFileId.photo(uid),
        ownerUid: uid,
        kind: 'photo',
        mime: 'image/jpeg',
        sizeBytes: compressed.sizeBytes,
        data: compressed.dataUrl,
      });

      onPhotoUploaded(compressed.dataUrl);
    } catch (err: any) {
      setPhotoError(err.message || 'ছবি আপলোড ব্যর্থ হয়েছে');
    } finally {
      setPhotoUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleSignatureSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSigError('');
    setSigUploading(true);

    try {
      // Auto resize & compress to 300x80, <=60KB JPEG
      const compressed = await compressImageToDataUrl(
        file,
        300,
        80,
        FILE_LIMITS.SIGNATURE,
        'image/jpeg'
      );

      if (compressed.sizeBytes > FILE_LIMITS.SIGNATURE) {
        throw new Error('স্বাক্ষরের সাইজ সর্বোচ্চ ৬০ KB হতে পারবে');
      }

      await saveFile({
        id: getFileId.signature(uid),
        ownerUid: uid,
        kind: 'signature',
        mime: 'image/jpeg',
        sizeBytes: compressed.sizeBytes,
        data: compressed.dataUrl,
      });

      onSignatureUploaded(compressed.dataUrl);
    } catch (err: any) {
      setSigError(err.message || 'স্বাক্ষর আপলোড ব্যর্থ হয়েছে');
    } finally {
      setSigUploading(false);
      if (sigInputRef.current) sigInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
      <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
        ৬. ছবি ও স্বাক্ষর আপলোড (Photo & Signature)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Box */}
        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center text-center space-y-3">
          <span className="text-xs font-bold text-gray-800">
            পাসপোর্ট সাইজ ছবি (300 × 300 px, সর্বোচ্চ 100 KB)
          </span>

          <div className="w-32 h-32 bg-white rounded-lg border-2 border-gray-200 overflow-hidden flex items-center justify-center relative shadow-xs">
            {photoUploading ? (
              <Spinner size="md" text="প্রসেসিং..." />
            ) : photoUrl ? (
              <img src={photoUrl} alt="Candidate" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Camera className="w-8 h-8 mb-1" />
                <span className="text-[10px]">ছবি নেই</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-gray-500 max-w-xs">
            যেকোনো সাইজের ছবি আপলোড করুন; ব্রাউজার স্বয়ংক্রিয়ভাবে ৩০০×৩০০ পিক্সেল ও ১০০ KB-এর নিচে রিসাইজ করে নিবে।
          </p>

          {photoError && <p className="text-xs text-rose-600 font-medium">{photoError}</p>}

          <input
            type="file"
            ref={photoInputRef}
            onChange={handlePhotoSelect}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          <button
            type="button"
            disabled={photoUploading}
            onClick={() => photoInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{photoUrl ? 'ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন'}</span>
          </button>
        </div>

        {/* Signature Box */}
        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center text-center space-y-3">
          <span className="text-xs font-bold text-gray-800">
            প্রার্থীর স্বাক্ষর (300 × 80 px, সর্বোচ্চ 60 KB)
          </span>

          <div className="w-48 h-20 bg-white rounded-lg border-2 border-gray-200 overflow-hidden flex items-center justify-center relative shadow-xs">
            {sigUploading ? (
              <Spinner size="md" text="প্রসেসিং..." />
            ) : signatureUrl ? (
              <img src={signatureUrl} alt="Signature" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <FileSignature className="w-7 h-7 mb-1" />
                <span className="text-[10px]">স্বাক্ষর নেই</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-gray-500 max-w-xs">
            সাদা কাগজে কালো কালির স্বাক্ষর আপলোড করুন; স্বয়ংক্রিয়ভাবে ৩০০×৮০ পিক্সেল ও ৬০ KB-তে কনভার্ট হবে।
          </p>

          {sigError && <p className="text-xs text-rose-600 font-medium">{sigError}</p>}

          <input
            type="file"
            ref={sigInputRef}
            onChange={handleSignatureSelect}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          <button
            type="button"
            disabled={sigUploading}
            onClick={() => sigInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{signatureUrl ? 'স্বাক্ষর পরিবর্তন করুন' : 'স্বাক্ষর আপলোড করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
