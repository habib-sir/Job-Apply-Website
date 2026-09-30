import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../../services/firebase';
import { JobCircular, JobCategory, JobStatus, JobPostItem } from '../../types';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import { JobPostsTableSection } from '../../components/admin/JobPostsTableSection';
import { generateSlug } from '../../utils/slugify';
import { useToast } from '../../components/common/Toast';
import { ArrowLeft, Save } from 'lucide-react';

export const AdminJobFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<JobCategory>('govt');
  const [status, setStatus] = useState<JobStatus>('published');
  const [publishedAt, setPublishedAt] = useState('');
  const [content, setContent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [applyLink, setApplyLink] = useState('');
  const [applyServiceEnabled, setApplyServiceEnabled] = useState(true);
  const [applicationFee, setApplicationFee] = useState<number>(100);
  const [serviceCharge, setServiceCharge] = useState<number>(50);
  const [featuredImage, setFeaturedImage] = useState('');
  const [circularFile, setCircularFile] = useState('');
  const [posts, setPosts] = useState<JobPostItem[]>([{ name: '', count: 1, district: 'ALL' }]);

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      try {
        const snap = await getDoc(doc(db, 'jobs', id));
        if (snap.exists()) {
          const data = snap.data() as JobCircular;
          setTitle(data.title || '');
          setSlug(data.slug || '');
          setCategory(data.category || 'govt');
          setStatus(data.status || 'published');
          setContent(data.content || '');
          setApplyLink(data.applyLink || '');
          setApplyServiceEnabled(Boolean(data.applyServiceEnabled));
          setApplicationFee(data.applicationFee || 0);
          setServiceCharge(data.serviceCharge || 0);
          setFeaturedImage(data.featuredImage || '');
          setCircularFile(data.circularFile || '');
          setPosts(data.posts || [{ name: '', count: 1, district: 'ALL' }]);

          if (data.deadline) {
            const dateObj = data.deadline.toDate ? data.deadline.toDate() : new Date(data.deadline);
            setDeadline(dateObj.toISOString().slice(0, 16));
          }
          if (data.publishedAt) {
            const pDate = data.publishedAt.toDate ? data.publishedAt.toDate() : new Date(data.publishedAt);
            setPublishedAt(pDate.toISOString().slice(0, 16));
          }
        }
      } catch (e) {
        error('তথ্য লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit || !slug) setSlug(generateSlug(val));
  };

  const handleFileUpload = async (file: File, type: 'featured' | 'circular') => {
    const jobId = id || doc(collection(db, 'jobs')).id;
    const ext = file.name.split('.').pop() || 'bin';
    const storageRef = ref(storage, `jobs/${jobId}/${type}.${ext}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    if (type === 'featured') setFeaturedImage(url);
    else setCircularFile(url);
    success('ফাইল আপলোড হয়েছে!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      error('বিজ্ঞপ্তির শিরোনাম ও স্লাগ পূরণ করুন');
      return;
    }

    setSaving(true);
    try {
      const jobId = id || doc(collection(db, 'jobs')).id;
      const jobData = {
        title,
        slug: slug.trim(),
        category,
        status,
        content,
        deadline: deadline ? new Date(deadline) : null,
        publishedAt: status === 'scheduled' && publishedAt ? new Date(publishedAt) : serverTimestamp(),
        applyLink: applyLink.trim(),
        applyServiceEnabled,
        applicationFee: Number(applicationFee) || 0,
        serviceCharge: Number(serviceCharge) || 0,
        featuredImage: featuredImage || null,
        circularFile: circularFile || null,
        posts,
        photoSpec: { width: 300, height: 300, maxKB: 100 },
        signatureSpec: { width: 300, height: 80, maxKB: 60 },
        updatedAt: serverTimestamp(),
      };

      if (isEdit) {
        await updateDoc(doc(db, 'jobs', jobId), jobData);
        success('সার্কুলার আপডেট সম্পন্ন হয়েছে');
      } else {
        await setDoc(doc(db, 'jobs', jobId), { ...jobData, createdAt: serverTimestamp() });
        success('নতুন সার্কুলার প্রকাশ করা হয়েছে');
      }
      navigate('/admin/jobs');
    } catch (err: any) {
      handleFirestoreError(err, isEdit ? OperationType.UPDATE : OperationType.CREATE, `jobs/${id || 'new'}`);
      error('সার্কুলার সেভ করতে ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" text="বিজ্ঞপ্তি লোড হচ্ছে..." />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/jobs" className="p-2 text-gray-500 hover:text-gray-900 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'চাকরির বিজ্ঞপ্তি সম্পাদনা' : 'নতুন চাকরির বিজ্ঞপ্তি প্রকাশ'}
          </h2>
        </div>
        <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
          {isEdit ? 'আপডেট করুন' : 'প্রকাশ করুন'}
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <Input
          label="বিজ্ঞপ্তির শিরোনাম (Job Title)"
          placeholder="যেমন: বাংলাদেশ রেলওয়ে নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          requiredStar
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="URL স্লাগ (Slug)" value={slug} onChange={(e) => setSlug(e.target.value)} requiredStar />
          <Select
            label="ক্যাটাগরি"
            value={category}
            onChange={(e) => setCategory(e.target.value as JobCategory)}
            options={[
              { value: 'govt', label: 'সরকারি চাকরি' },
              { value: 'private', label: 'বেসরকারি চাকরি' },
              { value: 'ngo', label: 'এনজিও চাকরি' },
              { value: 'pharma', label: 'ফার্মাসিউটিক্যাল' },
              { value: 'foreign', label: 'বিদেশি চাকরি' },
              { value: 'solution', label: 'সমাধান/অন্যান্য' },
            ]}
          />
          <Select
            label="পাবলিশিং স্ট্যাটাস"
            value={status}
            onChange={(e) => setStatus(e.target.value as JobStatus)}
            options={[
              { value: 'published', label: 'Published (সরাসরি প্রকাশ)' },
              { value: 'draft', label: 'Draft (খসড়া)' },
              { value: 'scheduled', label: 'Scheduled (নির্ধারিত সময়ে)' },
            ]}
          />
        </div>

        {status === 'scheduled' && (
          <Input label="প্রকাশের সময়সূচী" type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} requiredStar />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="আবেদনের শেষ তারিখ ও সময়" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} requiredStar />
          <Input label="অফিসিয়াল Teletalk আবেদন লিংক" placeholder="http://br.teletalk.com.bd" value={applyLink} onChange={(e) => setApplyLink(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-900">
          <input type="checkbox" checked={applyServiceEnabled} onChange={(e) => setApplyServiceEnabled(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
          <span>আমাদের অনলাইন আবেদন সেবা চালু রাখুন</span>
        </label>
        {applyServiceEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input label="টেলিটক আবেদন ফি (৳)" type="number" value={applicationFee} onChange={(e) => setApplicationFee(Number(e.target.value))} requiredStar />
            <Input label="আমাদের সার্ভিস চার্জ (৳)" type="number" value={serviceCharge} onChange={(e) => setServiceCharge(Number(e.target.value))} requiredStar />
          </div>
        )}
      </div>

      <JobPostsTableSection
        posts={posts}
        onAddPost={() => setPosts([...posts, { name: '', count: 1, district: 'ALL' }])}
        onUpdatePost={(idx, field, val) => {
          const u = [...posts];
          u[idx] = { ...u[idx], [field]: val };
          setPosts(u);
        }}
        onRemovePost={(idx) => setPosts(posts.filter((_, i) => i !== idx))}
      />

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <RichTextEditor label="সার্কুলারের সম্পূর্ণ বিবরণ (HTML Content)" value={content} onChange={setContent} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">সার্কুলার এটাচমেন্ট ও ছবি</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">ফিচার্ড ব্যানার ছবি</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'featured')} className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-emerald-50 file:text-emerald-700" />
            {featuredImage && <a href={featuredImage} target="_blank" rel="noreferrer" className="text-[11px] text-emerald-600 block mt-1 underline">ছবি দেখুন ↗</a>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">সার্কুলার PDF / স্ক্যান কপি</label>
            <input type="file" accept="application/pdf,image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'circular')} className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-sky-50 file:text-sky-700" />
            {circularFile && <a href={circularFile} target="_blank" rel="noreferrer" className="text-[11px] text-sky-600 block mt-1 underline">সার্কুলার ফাইল দেখুন ↗</a>}
          </div>
        </div>
      </div>
    </form>
  );
};
