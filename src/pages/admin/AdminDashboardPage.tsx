import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getCountFromServer,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { JobApplication } from '../../types';
import {
  Clock,
  Send,
  CheckCircle,
  CreditCard,
  CheckCheck,
  Briefcase,
  AlertCircle,
  TrendingUp,
  XCircle,
  Calendar,
} from 'lucide-react';
import { Spinner } from '../../components/common/Spinner';

export const AdminDashboardPage: React.FC = () => {
  const [counts, setCounts] = useState({
    waiting: 0,
    applyNow: 0,
    checking: 0,
    paymentNow: 0,
    complete: 0,
    rejected: 0,
    jobsTotal: 0,
  });
  const [urgentApps, setUrgentApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        // High-efficiency getCountFromServer to conserve Firestore read quota
        const [
          waitingCountSnap,
          applyNowCountSnap,
          checkingCountSnap,
          correctionCountSnap,
          paymentNowCountSnap,
          completeCountSnap,
          rejectedCountSnap,
          jobsCountSnap,
        ] = await Promise.all([
          getCountFromServer(query(collection(db, 'applications'), where('status', '==', 'waiting'))),
          getCountFromServer(query(collection(db, 'applications'), where('status', '==', 'apply_now'))),
          getCountFromServer(query(collection(db, 'applications'), where('status', '==', 'checking'))),
          getCountFromServer(query(collection(db, 'applications'), where('status', '==', 'correction'))),
          getCountFromServer(query(collection(db, 'applications'), where('status', '==', 'payment_now'))),
          getCountFromServer(query(collection(db, 'applications'), where('status', '==', 'applied'))),
          getCountFromServer(query(collection(db, 'applications'), where('status', '==', 'rejected'))),
          getCountFromServer(collection(db, 'jobs')),
        ]);

        setCounts({
          waiting: waitingCountSnap.data().count,
          applyNow: applyNowCountSnap.data().count,
          checking: checkingCountSnap.data().count + correctionCountSnap.data().count,
          paymentNow: paymentNowCountSnap.data().count,
          complete: completeCountSnap.data().count,
          rejected: rejectedCountSnap.data().count,
          jobsTotal: jobsCountSnap.data().count,
        });

        // Small targeted query for urgent active items (limit 5)
        const urgentSnap = await getDocs(
          query(
            collection(db, 'applications'),
            where('status', 'in', ['waiting', 'apply_now', 'payment_now']),
            limit(5)
          )
        );

        const list = urgentSnap.docs.map((d) => ({ id: d.id, ...d.data() } as JobApplication));
        setUrgentApps(list);
      } catch (e) {
        console.error('Error fetching admin counts:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" text="অ্যাডমিন পরিসংখ্যান লোড হচ্ছে..." />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Waiting List',
      sub: 'পেমেন্ট যাচাই বাকি',
      count: counts.waiting,
      icon: Clock,
      color: 'bg-amber-500',
      to: '/admin/applications/waiting',
    },
    {
      title: 'Apply Now',
      sub: 'Teletalk-এ আবেদন করতে হবে',
      count: counts.applyNow,
      icon: Send,
      color: 'bg-sky-500',
      to: '/admin/applications/apply-now',
    },
    {
      title: 'Check Application',
      sub: 'সফট কপি প্রার্থী যাচাই করছে',
      count: counts.checking,
      icon: CheckCircle,
      color: 'bg-indigo-500',
      to: '/admin/applications/check',
    },
    {
      title: 'Payment Now',
      sub: 'টেলিটক ফি পরিশোধের অপেক্ষায়',
      count: counts.paymentNow,
      icon: CreditCard,
      color: 'bg-rose-500',
      to: '/admin/applications/payment-now',
    },
    {
      title: 'Complete',
      sub: 'পেইড কপি সরবরাহকৃত',
      count: counts.complete,
      icon: CheckCheck,
      color: 'bg-emerald-500',
      to: '/admin/applications/complete',
    },
    {
      title: 'বাতিলকৃত (Rejected)',
      sub: 'বাতিল আবেদনসমূহ',
      count: counts.rejected,
      icon: XCircle,
      color: 'bg-gray-600',
      to: '/admin/applications/rejected',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">অ্যাডমিন ড্যাশবোর্ড ওভারভিউ</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            সকল আবেদন ও সিস্টেমের সার্বিক পরিসংখ্যান (মোট সার্কুলার: {counts.jobsTotal}টি)
          </p>
        </div>
        <Link
          to="/admin/jobs/new"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          + নতুন চাকরির বিজ্ঞপ্তি
        </Link>
      </div>

      {/* Urgent Pending Alert Banner */}
      {urgentApps.length > 0 && (
        <div className="p-5 bg-rose-50 rounded-2xl border border-rose-200 space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>জরুরি সতর্কতা: পেন্ডিং সক্রিয় আবেদন ({urgentApps.length}টি)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {urgentApps.map((u) => (
              <div key={u.id} className="p-3 bg-white rounded-xl border border-rose-200 shadow-2xs text-xs">
                <span className="font-mono font-bold text-rose-700">{u.id}</span>
                <span className="block font-semibold text-gray-900 line-clamp-1 mt-0.5">{u.jobTitle}</span>
                <span className="text-[11px] text-gray-500 block">পদ: {u.postName}</span>
                <span className="text-[10px] font-bold text-amber-600 mt-1 block">
                  স্ট্যাটাস: {u.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5-Step Pipeline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              to={card.to}
              className="bg-white p-5 rounded-xl border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-gray-500">{card.title}</span>
                <div className="text-2xl font-extrabold text-gray-900 mt-1">{card.count}</div>
                <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl ${card.color} text-white flex items-center justify-center shadow-xs`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Workflow instructions banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>আবেদন প্রক্রিয়াকরণের ৫টি নির্ধারিত ধাপ:</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          <div className="p-3 bg-amber-50 rounded-lg text-xs border border-amber-100">
            <span className="font-bold text-amber-800 block mb-1">১. Waiting</span>
            <p className="text-amber-700 text-[11px]">প্রার্থীর bKash/Rocket TrxID যাচাই করে অনুমোদন করুন।</p>
          </div>
          <div className="p-3 bg-sky-50 rounded-lg text-xs border border-sky-100">
            <span className="font-bold text-sky-800 block mb-1">২. Apply Now</span>
            <p className="text-sky-700 text-[11px]">Teletalk-এ আবেদন করে সফট কপি PDF বা ড্রাইভ লিংক দিন।</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-xs border border-indigo-100">
            <span className="font-bold text-indigo-800 block mb-1">৩. Check</span>
            <p className="text-indigo-700 text-[11px]">প্রার্থী তথ্য ঠিক আছে নিশ্চিত করলে Payment Now-তে যাবে।</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg text-xs border border-rose-100">
            <span className="font-bold text-rose-800 block mb-1">৪. Payment Now</span>
            <p className="text-rose-700 text-[11px]">Teletalk ফি পরিশোধ করে পেইড কপি PDF বা ড্রাইভ লিংক দিন।</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-xs border border-emerald-100">
            <span className="font-bold text-emerald-800 block mb-1">৫. Complete</span>
            <p className="text-emerald-700 text-[11px]">আবেদন সফল ও সম্পন্ন হয়েছে। পেইড কপি সংরক্ষিত।</p>
          </div>
        </div>
      </div>
    </div>
  );
};
