import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}

export const CVDeleteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  deleting,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="সিভি মুছে ফেলা নিশ্চিত করুন"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={deleting}>
            বাতিল
          </Button>
          <Button variant="danger" size="sm" loading={deleting} onClick={onConfirm}>
            হ্যাঁ, সিভি মুছে ফেলুন
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-xs text-gray-700">
        <div className="flex items-start gap-2 text-rose-600 font-semibold">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>সতর্কতা: এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না!</span>
        </div>
        <p>
          আপনি নিশ্চিত যে আপনার সংরক্ষিত সকল সিভি তথ্য ও আপলোড করা ছবি/স্বাক্ষর মুছে ফেলতে চান? পরবর্তী সময়ে চাকরির আবেদনের জন্য আপনাকে নতুন করে সব তথ্য পূরণ করতে হবে।
        </p>
      </div>
    </Modal>
  );
};
