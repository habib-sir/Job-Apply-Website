import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { JobApplication, CandidateProfile, ApplicationStatus } from '../../types';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { canTransitionStatus, createUserNotification } from '../../utils/statusTransitions';
import { ApplicationCardItem } from '../../components/admin/ApplicationCardItem';
import {
  RejectModal,
  UploadSoftCopyModal,
  CompletePaidModal,
  AutofillModal,
} from '../../components/admin/ApplicationActionModals';

export const AdminApplicationsPage: React.FC = () => {
  const { step } = useParams<{ step: string }>();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeApp, setActiveApp] = useState<JobApplication | null>(null);
  const [activeProfile, setActiveProfile] = useState<CandidateProfile | null>(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [softCopyModalOpen, setSoftCopyModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [autofillModalOpen, setAutofillModalOpen] = useState(false);

  const stepStatusMap: Record<string, ApplicationStatus[]> = {
    waiting: ['waiting'],
    'apply-now': ['apply_now'],
    check: ['checking', 'correction'],
    'payment-now': ['payment_now'],
    complete: ['applied'],
    rejected: ['rejected'],
  };

  const targetStatuses = stepStatusMap[step || 'waiting'] || ['waiting'];

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'applications'));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as JobApplication))
        .filter((a) => targetStatuses.includes(a.status))
        .sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
          return tB - tA;
        });
      setApps(list);
    } catch (err) {
      error('আবেদন তালিকা লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [step]);

  const handleVerifyPayment = async (app: JobApplication) => {
    if (!canTransitionStatus(app.status, 'apply_now')) {
      error('এই স্ট্যাটাস পরিবর্তন অনুমোদিত নয়');
      return;
    }

    try {
      await updateDoc(doc(db, 'applications', app.id), {
        status: 'apply_now',
        'payment.verified': true,
        'payment.verifiedAt': serverTimestamp(),
        'payment.verifiedBy': user?.email || 'admin',
        updatedAt: serverTimestamp(),
      });

      await createUserNotification(
        app.uid,
        app.id,
        'পেমেন্ট যাচাই সফল হয়েছে',
        `আপনার আবেদন (${app.id})-এর ফি যাচাই করা হয়েছে। অপারেটর এখন Teletalk পোর্টালে ফর্ম পূরণ করছেন।`
      );

      success('পেমেন্ট যাচাই সফল! আবেদনটি Apply Now তালিকায় পাঠানো হয়েছে।');
      fetchApplications();
    } catch (err) {
      error('আপডেট করতে ব্যর্থ হয়েছে');
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!activeApp) return;
    try {
      await updateDoc(doc(db, 'applications', activeApp.id), {
        status: 'rejected',
        rejectReason: reason,
        updatedAt: serverTimestamp(),
      });

      await createUserNotification(
        activeApp.uid,
        activeApp.id,
        'আবেদন বাতিল করা হয়েছে',
        `আপনার আবেদন (${activeApp.id}) বাতিল করা হয়েছে। কারণ: ${reason}`
      );

      success('আবেদনটি বাতিল করা হয়েছে।');
      fetchApplications();
    } catch (err) {
      error('বাতিল করতে ব্যর্থ হয়েছে');
    }
  };

  const handleOpenAutofill = async (app: JobApplication) => {
    setActiveApp(app);
    try {
      const snap = await getDoc(doc(db, 'profiles', app.uid));
      if (snap.exists()) {
        setActiveProfile(snap.data() as CandidateProfile);
        setAutofillModalOpen(true);
      } else {
        error('প্রার্থীর সিভি প্রোফাইল পাওয়া যায়নি');
      }
    } catch (e) {
      error('প্রোফাইল লোড করতে সমস্যা হয়েছে');
    }
  };

  const handleUploadSoftCopy = async (file: File) => {
    if (!activeApp) return;
    try {
      const ext = file.name.split('.').pop() || 'pdf';
      const path = `applications/${activeApp.id}/soft_copy.${ext}`;
      const sRef = ref(storage, path);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);

      await updateDoc(doc(db, 'applications', activeApp.id), {
        status: 'checking',
        softCopyPath: path,
        softCopyUrl: url,
        updatedAt: serverTimestamp(),
      });

      await createUserNotification(
        activeApp.uid,
        activeApp.id,
        'সফট কপি প্রস্তুত হয়েছে',
        `আপনার আবেদন (${activeApp.id})-এর সফট কপি প্রস্তুত হয়েছে। Check Application পেজে গিয়ে সফট কপিটি দেখে অনুমোদন দিন।`
      );

      success('সফট কপি আপলোড সম্পন্ন ও প্রার্থীকে পাঠানো হয়েছে!');
      fetchApplications();
    } catch (err) {
      error('সফট কপি আপলোড করতে সমস্যা হয়েছে');
    }
  };

  const handleCompletePaid = async (file: File) => {
    if (!activeApp) return;
    try {
      const ext = file.name.split('.').pop() || 'pdf';
      const paidPath = `applications/${activeApp.id}/paid_copy.${ext}`;
      const pRef = ref(storage, paidPath);
      await uploadBytes(pRef, file);
      const paidUrl = await getDownloadURL(pRef);

      if (activeApp.softCopyPath) {
        try {
          await deleteObject(ref(storage, activeApp.softCopyPath));
        } catch (e) {
          // Ignore
        }
      }

      await updateDoc(doc(db, 'applications', activeApp.id), {
        status: 'applied',
        paidCopyPath: paidPath,
        paidCopyUrl: paidUrl,
        softCopyPath: null,
        softCopyUrl: null,
        updatedAt: serverTimestamp(),
      });

      await createUserNotification(
        activeApp.uid,
        activeApp.id,
        'আবেদন সম্পন্ন! পেইড কপি ডাউনলোড করুন',
        `অভিনন্দন! আপনার আবেদন (${activeApp.id}) সফলভাবে সম্পন্ন হয়েছে এবং অফিসিয়াল পেইড কপি সরবরাহ করা হয়েছে।`
      );

      success('আবেদন সম্পন্ন হয়েছে এবং পেইড কপি যুক্ত হয়েছে!');
      fetchApplications();
    } catch (err) {
      error('পেইড কপি সংরক্ষণ করতে সমস্যা হয়েছে');
    }
  };

  const pageTitles: Record<string, string> = {
    waiting: '১. Waiting List (পেমেন্ট যাচাই)',
    'apply-now': '২. Apply Now (Teletalk আবেদন ও সফট কপি)',
    check: '৩. Check Application (প্রার্থী রিভিউ ও সংশোধন)',
    'payment-now': '৪. Payment Now (টেলিটক ফি পরিশোধ)',
    complete: '৫. Complete (সম্পন্ন আবেদন ও পেইড কপি)',
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{pageTitles[step || 'waiting'] || 'আবেদন তালিকা'}</h2>
          <p className="text-xs text-gray-500 mt-0.5">মোট আবেদন সংখ্যা: {apps.length}টি</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="আবেদন লোড হচ্ছে..." />
        </div>
      ) : apps.length === 0 ? (
        <EmptyState title="এই ধাপে কোনো আবেদন নেই" description="বর্তমানে এই পাইপলাইনে কোনো পেন্ডিং আবেদন পাওয়া যায়নি।" />
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <ApplicationCardItem
              key={app.id}
              app={app}
              onReject={(a) => {
                setActiveApp(a);
                setRejectModalOpen(true);
              }}
              onVerifyPayment={handleVerifyPayment}
              onOpenAutofill={handleOpenAutofill}
              onOpenSoftCopyModal={(a) => {
                setActiveApp(a);
                setSoftCopyModalOpen(true);
              }}
              onOpenCompleteModal={(a) => {
                setActiveApp(a);
                setCompleteModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <RejectModal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} appId={activeApp?.id || ''} onConfirm={handleRejectConfirm} />
      <UploadSoftCopyModal isOpen={softCopyModalOpen} onClose={() => setSoftCopyModalOpen(false)} appId={activeApp?.id || ''} onUpload={handleUploadSoftCopy} />
      <CompletePaidModal isOpen={completeModalOpen} onClose={() => setCompleteModalOpen(false)} appId={activeApp?.id || ''} onUploadPaid={handleCompletePaid} />
      <AutofillModal isOpen={autofillModalOpen} onClose={() => setAutofillModalOpen(false)} app={activeApp} profile={activeProfile} />
    </div>
  );
};
