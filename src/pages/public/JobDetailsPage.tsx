import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { JobCircular } from '../../types';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/common/Button';
import {
  Calendar,
  Briefcase,
  MapPin,
  Send,
  AlertCircle,
  ArrowLeft,
  Download,
  Users,
  CheckCircle2,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { useAuth } from '../../context/AuthContext';

export const JobDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<JobCircular | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      if (!slug) return;
      try {
        const q = query(collection(db, 'jobs'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docItem = snap.docs[0];
          setJob({ id: docItem.id, ...docItem.data() } as JobCircular);
        } else {
          const docRef = doc(db, 'jobs', slug);
          const singleSnap = await getDoc(docRef);
          if (singleSnap.exists()) {
            setJob({ id: singleSnap.id, ...singleSnap.data() } as JobCircular);
          }
        }
      } catch (err) {
        // Silently handled
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" text="বিজ্ঞপ্তি বিবরণ লোড হচ্ছে..." />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-gray-800 mb-2">বিজ্ঞপ্তিটি পাওয়া যায়নি</h2>
        <p className="text-xs text-gray-500 mb-5">হয়তো লিংকটি ভুল অথবা বিজ্ঞপ্তিটি সরানো হয়েছে।</p>
        <Link to="/jobs">
          <Button variant="outline">সকল চাকরি দেখুন</Button>
        </Link>
      </div>
    );
  }

  const now = new Date();
  const deadlineDate = job.deadline
    ? job.deadline.toDate
      ? job.deadline.toDate()
      : new Date(job.deadline)
    : null;

  const isExpired = deadlineDate ? deadlineDate.getTime() < now.getTime() : false;

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/apply/${job.id}` } });
    } else {
      navigate(`/apply/${job.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Helmet>
        <title>{job.title} | চাকরি আবেদন সার্ভিস</title>
        <meta
          name="description"
          content={`${job.title}। সরকারি ও টেলিটক অনলাইন আবেদন সেবা। আবেদনের শেষ তারিখ: ${
            deadlineDate ? deadlineDate.toLocaleDateString('bn-BD') : 'বিজ্ঞপ্তি দেখুন'
          }`}
        />
        <meta property="og:title" content={job.title} />
        <meta property="og:description" content="টেলিটকে অনলাইনে নির্ভুলভাবে আবেদনের সুযোগ।" />
        {job.featuredImage && <meta property="og:image" content={job.featuredImage} />}
      </Helmet>

      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>সকল চাকরিতে ফিরে যান</span>
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6 shadow-xs">
        {/* Top Header */}
        <div className="border-b border-gray-100 pb-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold">
              {job.category === 'govt' ? 'সরকারি প্রতিষ্ঠান' : 'বেসরকারি/অন্যান্য'}
            </span>

            {isExpired ? (
              <span className="px-3 py-1 bg-rose-50 text-rose-800 rounded-full text-xs font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>মেয়াদ শেষ</span>
              </span>
            ) : (
              <span className="px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>আবেদন চলছে</span>
              </span>
            )}
          </div>

          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-snug">
            {job.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>
                আবেদনের শেষ সময়:{' '}
                <strong className={isExpired ? 'text-rose-600 font-bold' : 'text-gray-900'}>
                  {deadlineDate ? deadlineDate.toLocaleString('bn-BD') : 'বিজ্ঞপ্তি দেখুন'}
                </strong>
              </span>
            </div>

            {job.applyServiceEnabled && !isExpired && (
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <Send className="w-4 h-4" />
                <span>অনলাইন আবেদন ও সফট কপি সার্ভিস চালু</span>
              </div>
            )}
          </div>
        </div>

        {/* Featured Image if any */}
        {job.featuredImage && (
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <img src={job.featuredImage} alt={job.title} className="w-full max-h-96 object-cover" />
          </div>
        )}

        {/* Posts Breakdown Table */}
        {job.posts && job.posts.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>পদের তালিকা ও জেলা ভিত্তিক শর্তাবলী</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left bg-white rounded-lg border border-gray-200">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-2.5">পদের নাম</th>
                    <th className="p-2.5">পদসংখ্যা</th>
                    <th className="p-2.5">আবেদনের অনুমোদিত জেলা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {job.posts.map((p, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-gray-800">{p.name}</td>
                      <td className="p-2.5 text-gray-600">{p.count} জন</td>
                      <td className="p-2.5 text-emerald-700 font-medium">
                        {p.district === 'ALL' ? 'সারাদেশ (সকল জেলা)' : p.district}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Circular Details Content (Sanitized) */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
            বিজ্ঞপ্তির বিস্তারিত বিবরণ:
          </h3>
          <div
            className="prose prose-sm max-w-none text-gray-800 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.content || '') }}
          />
        </div>

        {/* Circular File / PDF Attachment Download */}
        {job.circularFile && (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div className="text-xs text-emerald-900">
              <span className="font-bold block">অফিসিয়াল সার্কুলার ফাইল / নোটিশ</span>
              <span>মূল সার্কুলারটি পড়তে বা ডাউনলোড করতে পাশের বাটনে ক্লিক করুন।</span>
            </div>
            <a
              href={job.circularFile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>সার্কুলার দেখুন</span>
            </a>
          </div>
        )}

        {/* Apply CTA Section */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-5 rounded-xl">
          <div>
            <h4 className="font-bold text-gray-900 text-sm">
              {isExpired
                ? 'আবেদনের সময়সীমা শেষ'
                : job.applyServiceEnabled
                ? 'আমাদের মাধ্যমে অনলাইনে আবেদন করতে চান?'
                : 'অফিসিয়াল ওয়েবসাইটে আবেদন'}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {isExpired
                ? 'এই সার্কুলারের ডেডলাইন অতিক্রান্ত হয়েছে, ফলে আর আবেদন করা যাবে না।'
                : job.applyServiceEnabled
                ? `টেলিটক ফি: ৳${job.applicationFee} + সার্ভিস চার্জ: ৳${job.serviceCharge} (মোট ৳${job.applicationFee + job.serviceCharge})`
                : 'বিজ্ঞপ্তিতে দেওয়া অফিশিয়াল লিংক ব্যবহার করে আবেদন করুন।'}
            </p>
          </div>

          {!isExpired && job.applyServiceEnabled ? (
            <Button onClick={handleApplyClick} icon={<Send className="w-4 h-4" />}>
              আবেদন করুন
            </Button>
          ) : !isExpired && job.applyLink ? (
            <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">অফিসিয়াল লিংকে যান ↗</Button>
            </a>
          ) : (
            <span className="px-3 py-1.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg">
              মেয়াদোত্তীর্ণ (আবেদন বন্ধ)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
