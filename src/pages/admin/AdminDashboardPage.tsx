import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { JobApplication, JobCircular } from '../../types';
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
        const appsSnap = await getDocs(collection(db, 'applications'));
        const jobsSnap = await getDocs(collection(db, 'jobs'));

        // Map jobs to deadline map
        const jobDeadlines: Record<string, Date> = {};
        jobsSnap.docs.forEach((docItem) => {
          const j = docItem.data() as JobCircular;
          if (j.deadline) {
            jobDeadlines[docItem.id] = j.deadline.toDate ? j.deadline.toDate() : new Date(j.deadline);
          }
        });

        let w = 0;
        let an = 0;
        let c = 0;
        let pn = 0;
        let comp = 0;
        let rej = 0;

        const now = new Date();
        const twoDaysMs = 48 * 60 * 60 * 1000;
        const urgentList: JobApplication[] = [];

        appsSnap.docs.forEach((docItem) => {
          const app = { id: docItem.id, ...docItem.data() } as JobApplication;
          if (app.status === 'waiting') w++;
          else if (app.status === 'apply_now') an++;
          else if (app.status === 'checking' || app.status === 'correction') c++;
          else if (app.status === 'payment_now') pn++;
          else if (app.status === 'applied') comp++;
          else if (app.status === 'rejected') rej++;

          // Check if pending and has urgent deadline
          if (app.status !== 'applied' && app.status !== 'rejected') {
            const dl = jobDeadlines[app.jobId];
            if (dl) {
              const diff = dl.getTime() - now.getTime();
              if (diff > 0 && diff <= twoDaysMs) {
                urgentList.push({ ...app, deadline: dl });
              }
            }
          }
        });

        setCounts({
          waiting: w,
          applyNow: an,
          checking: c,
          paymentNow: pn,
          complete: comp,
          rejected: rej,
          jobsTotal: jobsSnap.size,
        });

        setUrgentApps(urgentList.slice(0, 5));
      } catch (e) {
        // Silently handled
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
            সকল আবেদন ও সিস্টেমের সার্বিক পরিসংখ্যান
          </p>
        </div>
        <Link
          to="/admin/jobs/new"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          + নতুন চাকরির বিজ্ঞপ্তি
        </Link>
      </div>

      {/* Urgent Alert Banner (Today/Tomorrow Deadline) */}
      {urgentApps.length > 0 && (
        <div className="p-5 bg-rose-50 rounded-2xl border border-rose-200 space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>জরুরি সতর্কতা: আজ অথবা আগামীকাল শেষ হওয়া পেন্ডিং আবেদন ({urgentApps.length}টি)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {urgentApps.map((u) => (
              <div key={u.id} className="p-3 bg-white rounded-xl border border-rose-200 shadow-2xs text-xs">
                <span className="font-mono font-bold text-rose-700">{u.id}</span>
                <span className="block font-semibold text-gray-900 line-clamp-1 mt-0.5">{u.jobTitle}</span>
                <span className="text-[11px] text-gray-500 block">পদ: {u.postName}</span>
                <span className="text-[10px] font-bold text-rose-600 mt-1 block">
                  ডেডলাইন: {new Date(u.deadline).toLocaleDateString('bn-BD')}
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
            <p className="text-sky-700 text-[11px]">Teletalk-এ আবেদন করে সফট কপি PDF আপলোড করুন।</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-xs border border-indigo-100">
            <span className="font-bold text-indigo-800 block mb-1">৩. Check</span>
            <p className="text-indigo-700 text-[11px]">প্রার্থী তথ্য ঠিক আছে নিশ্চিত করলে Payment Now-তে যাবে।</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg text-xs border border-rose-100">
            <span className="font-bold text-rose-800 block mb-1">৪. Payment Now</span>
            <p className="text-rose-700 text-[11px]">Teletalk ফি পরিশোধ করে পেইড কপি PDF আপলোড করুন।</p>
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
