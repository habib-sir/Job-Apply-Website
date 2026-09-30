import React, { useState } from 'react';
import { HardDrive } from 'lucide-react';
import { GoogleDriveModal } from './GoogleDriveModal';

interface DrivePickerButtonProps {
  onSelectDriveUrl: (url: string, fileName?: string) => void;
  label?: string;
  acceptMime?: 'pdf' | 'images' | 'all';
  className?: string;
  size?: 'sm' | 'md';
}

export const DrivePickerButton: React.FC<DrivePickerButtonProps> = ({
  onSelectDriveUrl,
  label = 'Google Drive থেকে বেছে নিন',
  acceptMime = 'all',
  className = '',
  size = 'sm',
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-700 ${
          size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
        } ${className}`}
      >
        <HardDrive className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>{label}</span>
      </button>

      <GoogleDriveModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        acceptMime={acceptMime}
        onSelectFile={(file) => {
          onSelectDriveUrl(file.webViewLink, file.name);
          setModalOpen(false);
        }}
      />
    </>
  );
};
