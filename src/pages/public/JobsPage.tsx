import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Calendar, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { JobCircular, JobCategory } from '../../types';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';

const ITEMS_PER_PAGE = 20;

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobCircular[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const snap = await getDocs(collection(db, 'jobs'));
        const now = new Date();

        const published = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as JobCircular))
          .filter((j) => {
            if (j.status === 'published') return true;
            if (j.status === 'scheduled' && j.publishedAt) {
              const pubTime = j.publishedAt.toDate ? j.publishedAt.toDate() : new Date(j.publishedAt);
              return pubTime <= now;
            }
            return false;
          })
          .sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
            return timeB - timeA;
          });

        setJobs(published);
      } catch (e) {
        // Silently handled
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const now = new Date();

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.posts?.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE) || 1;
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Helmet>
        <title>সকল সরকারি ও অন্যান্য চাকরির খবর | ২০টি করে পেজিনেশন</title>
        <meta
          name="description"
          content="চলমান সকল সরকারি ও বেসরকারি চাকরির নিয়োগ বিজ্ঞপ্তি খুঁজুন এবং সরাসরি অনলাইনে নির্ভুল আবেদন করুন।"
        />
      </Helmet>

      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          সকল চাকরির খবর ও নিয়োগ বিজ্ঞপ্তি
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          মোট {filteredJobs.length}টি বিজ্ঞপ্তি পাওয়া গেছে (প্রতি পেজে ২০টি করে)
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="চাকরি বা পদের নাম দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-600"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-emerald-600 sm:w-48"
        >
          <option value="all">সকল ক্যাটাগরি</option>
          <option value="govt">সরকারি চাকরি</option>
          <option value="private">বেসরকারি চাকরি</option>
          <option value="ngo">এনজিও চাকরি</option>
          <option value="pharma">ফার্মাসিউটিক্যাল</option>
          <option value="foreign">বিদেশি চাকরি</option>
          <option value="solution">সমাধান/অন্যান্য</option>
        </select>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="চাকরির বিজ্ঞপ্তি লোড হচ্ছে..." />
        </div>
      ) : paginatedJobs.length === 0 ? (
        <EmptyState
          title="কোনো বিজ্ঞপ্তি পাওয়া যায়নি"
          description="আপনার সার্চের সাথে মিলে এমন কোনো চাকরি বর্তমানে নেই।"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedJobs.map((job) => {
            const isExpired = job.deadline
              ? new Date(job.deadline.toDate ? job.deadline.toDate() : job.deadline).getTime() < now.getTime()
              : false;

            return (
              <Link
                key={job.id}
                to={`/jobs/${job.slug || job.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                      {job.category === 'govt' ? 'সরকারি' : 'অন্যান্য'}
                    </span>
                    {isExpired ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700">
                        মেয়াদ শেষ
                      </span>
                    ) : (
                      job.applyServiceEnabled && (
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          আবেদন সেবা চালু
                        </span>
                      )
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 hover:text-emerald-700">
                    {job.title}
                  </h3>
                  {job.posts && job.posts.length > 0 && (
                    <p className="text-[11px] text-gray-500 mb-2">
                      পদ: {job.posts.map((p) => p.name).slice(0, 2).join(', ')}
                      {job.posts.length > 2 ? ` (+${job.posts.length - 2}টি)` : ''}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      শেষ:{' '}
                      {job.deadline
                        ? new Date(job.deadline.toDate ? job.deadline.toDate() : job.deadline).toLocaleDateString('bn-BD')
                        : 'বিজ্ঞপ্তি দেখুন'}
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-700">আবেদন করুন →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-gray-700 px-3">
            পৃষ্ঠা {currentPage} এর {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
