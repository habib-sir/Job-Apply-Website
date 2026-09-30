import React from 'react';
import { JobApplication } from '../../types';
import { Button } from '../common/Button';
import {
  MessageCircle,
  XCircle,
  CheckCircle,
  ExternalLink,
  Send,
  Upload,
  FileDown,
  CheckCheck,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  app: JobApplication;
  onReject: (app: JobApplication) => void;
  onVerifyPayment: (app: JobApplication) => void;
  onOpenAutofill: (app: JobApplication) => void;
  onOpenSoftCopyModal: (app: JobApplication) => void;
  onOpenCompleteModal: (app: JobApplication) => void;
}

export const ApplicationCardItem: React.FC<Props> = ({
  app,
  onReject,
  onVerifyPayment,
  onOpenAutofill,
  onOpenSoftCopyModal,
  onOpenCompleteModal,
}) => {
  const getWhatsAppLink = (mobileNo: string, appId: string) => {
    const cleanNum = mobileNo.replace(/\D/g, '');
    const intlNum = cleanNum.startsWith('880') ? cleanNum : `880${cleanNum.replace(/^0/, '')}`;
    const msg = encodeURIComponent(`হ্যালো, আপনার চাকরি আবেদন আইডি (${appId}) নিয়ে যোগাযোগ করছি...`);
    return `https://wa.me/${intlNum}?text=${msg}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-extrabold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md">
            {app.id}
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">{app.jobTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getWhatsAppLink(app.smsNumber || app.mobile, app.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 transition-colors"
            title="প্রার্থীকে WhatsApp বার্তা পাঠান"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              app.status === 'applied'
                ? 'bg-emerald-100 text-emerald-800'
                : app.status === 'payment_now'
                ? 'bg-rose-100 text-rose-800'
                : app.status === 'correction'
                ? 'bg-amber-100 text-amber-800'
                : app.status === 'checking'
                ? 'bg-sky-100 text-sky-800'
                : 'bg-amber-50 text-amber-800'
            }`}
          >
            {app.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-gray-400 block">প্রার্থী:</span>
          <span className="font-bold text-gray-900 break-words">{app.fullName}</span>
        </div>
        <div>
          <span className="text-gray-400 block">পদ ও জেলা:</span>
          <span className="font-semibold text-gray-800 break-words">{app.postName} ({app.district})</span>
        </div>
        <div>
          <span className="text-gray-400 block">মোবাইল:</span>
          <span className="font-semibold text-gray-800 break-words">{app.smsNumber}</span>
        </div>
        <div>
          <span className="text-gray-400 block">পেমেন্ট ও TrxID:</span>
          <span className="font-mono font-bold text-emerald-700 break-all block">
            ৳{app.fee?.total} ({app.payment?.method}) • {app.payment?.trxId}
          </span>
          {app.payment?.senderNumber && (
            <span className="text-[10px] text-gray-500 block break-words">প্রেরক: {app.payment.senderNumber}</span>
          )}
        </div>
      </div>

      {app.payment?.screenshotUrl && (
        <div className="text-xs">
          <a
            href={app.payment.screenshotUrl}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-700 underline font-semibold"
          >
            পেমেন্ট স্ক্রিনশট দেখুন ↗
          </a>
        </div>
      )}

      {app.correctionNote && (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
          <span className="font-bold block mb-0.5 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>প্রার্থীর সংশোধনের অনুরোধ:</span>
          </span>
          <span>{app.correctionNote}</span>
        </div>
      )}

      <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2">
        {app.status === 'waiting' && (
          <>
            <Button size="sm" variant="danger" onClick={() => onReject(app)} icon={<XCircle className="w-3.5 h-3.5" />}>
              বাতিল
            </Button>
            <Button size="sm" variant="success" onClick={() => onVerifyPayment(app)} icon={<CheckCircle className="w-3.5 h-3.5" />}>
              যাচাই OK (Apply Now)
            </Button>
          </>
        )}

        {app.status === 'apply_now' && (
          <>
            {app.applyLink && (
              <a href={app.applyLink} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                  Teletalk লিংক
                </Button>
              </a>
            )}
            <Button size="sm" variant="secondary" onClick={() => onOpenAutofill(app)} icon={<Send className="w-3.5 h-3.5" />}>
              Autofill-এ পাঠান
            </Button>
            <Button size="sm" onClick={() => onOpenSoftCopyModal(app)} icon={<Upload className="w-3.5 h-3.5" />}>
              সফট কপি PDF আপলোড
            </Button>
          </>
        )}

        {(app.status === 'checking' || app.status === 'correction') && (
          <>
            {app.softCopyUrl && (
              <a href={app.softCopyUrl} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline" icon={<FileDown className="w-3.5 h-3.5" />}>
                  বর্তমান সফট কপি
                </Button>
              </a>
            )}
            <Button size="sm" onClick={() => onOpenSoftCopyModal(app)} icon={<Upload className="w-3.5 h-3.5" />}>
              নতুন সংশোধিত কপি আপলোড
            </Button>
          </>
        )}

        {app.status === 'payment_now' && (
          <Button size="sm" variant="success" onClick={() => onOpenCompleteModal(app)} icon={<CheckCheck className="w-3.5 h-3.5" />}>
            Complete (পেইড কপি আপলোড)
          </Button>
        )}

        {app.status === 'applied' && app.paidCopyUrl && (
          <a href={app.paidCopyUrl} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" icon={<FileDown className="w-3.5 h-3.5" />}>
              পেইড কপি PDF ডাউনলোড
            </Button>
          </a>
        )}
      </div>
    </div>
  );
};
