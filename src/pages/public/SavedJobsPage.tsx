import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Bookmark, BookmarkCheck, Calendar, ArrowRight } from 'lucide-react';
import { JobCircular } from '../../types';
import { fetchJobsList } from '../../services/jobsStore';
import { getPublicJobSlug } from '../../utils/slugify';
import { safeFormatBnDate, isJobExpired } from '../../utils/dateUtils';
import { getSavedJobIds, subscribeToSavedJobs, toggleSavedJob } from '../../services/savedJobs';
import { isDummyJob } from '../../utils/recoverLocalJobs';

export const SavedJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobCircular[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedJobIds());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchJobsList()
      .then((list) => {
        if (active) setJobs((list as JobCircular[]).filter((job) => !isDummyJob(job)));
      })
      .catch(() => {
        if (active) setJobs([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => subscribeToSavedJobs(() => setSavedIds(getSavedJobIds())), []);

  const savedJobs = jobs.filter((job) => savedIds.includes(String(job.id)));

  const removeSaved = (id: string) => {
    toggleSavedJob(id);
    setSavedIds(getSavedJobIds());
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Helmet>
        <title>সংরক্ষিত চাকরি | BD Job Apply</title>
        <meta name="description" content="আপনার সংরক্ষণ করে রাখা সরকারি, বেসরকারি ও NGO চাকরির তালিকা দেখুন।" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://bdjobapply.site/saved-jobs/" />
      </Helmet>
      <header className="border-b border-gray-200 pb-4">
        <p className="text-sm font-bold text-emerald-700">আপনার shortlist</p>
        <h1 className="mt-1 text-2xl font-extrabold text-gray-950">সংরক্ষিত চাকরি</h1>
        <p className="mt-1 text-sm text-gray-600">যে চাকরিগুলো পরে দেখবেন, সেগুলো এই device-এ সংরক্ষিত থাকে।</p>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">সংরক্ষিত চাকরি লোড হচ্ছে...</div>
      ) : savedJobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <Bookmark className="mx-auto h-8 w-8 text-emerald-600" aria-hidden="true" />
          <h2 className="mt-3 font-bold text-gray-900">এখনো কোনো চাকরি সংরক্ষণ করা হয়নি</h2>
          <p className="mt-1 text-sm text-gray-600">চাকরির card-এ bookmark বাটনে চাপ দিয়ে shortlist তৈরি করুন।</p>
          <Link to="/jobs" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white">চাকরি দেখুন <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {savedJobs.map((job) => {
            const expired = isJobExpired(job.deadline, new Date());
            return (
              <article key={job.id} className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">{job.category === 'govt' ? 'সরকারি' : 'অন্যান্য'}</span>
                    <button type="button" onClick={() => removeSaved(String(job.id))} className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-50" aria-label="সংরক্ষিত চাকরি থেকে সরান" title="সংরক্ষিত তালিকা থেকে সরান"><BookmarkCheck className="h-5 w-5" /></button>
                  </div>
                  <h2 className="mt-3 line-clamp-2 text-sm font-bold text-gray-900">{job.title}</h2>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-500">
                  <span className={expired ? 'text-rose-600' : ''}><Calendar className="mr-1 inline h-3.5 w-3.5" />শেষ: {safeFormatBnDate(job.deadline)}</span>
                  <Link to={`/jobs/${getPublicJobSlug(job)}`} state={{ preloadedJob: job }} className="font-semibold text-emerald-700 hover:underline">বিস্তারিত →</Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
