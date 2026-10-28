import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, Users } from 'lucide-react';

export const AboutPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
    <Helmet><title>আমাদের সম্পর্কে | BD Job Apply</title><meta name="description" content="BD Job Apply-এর চাকরির খবর, CV প্রস্তুতি এবং অনলাইন আবেদন সহায়তা সম্পর্কে জানুন।" /><link rel="canonical" href="https://bdjobapply.site/about" /></Helmet>
    <header className="space-y-3"><p className="text-sm font-bold text-emerald-700">আমাদের সম্পর্কে</p><h1 className="text-3xl font-extrabold text-gray-950">চাকরির আবেদনকে সহজ, পরিষ্কার ও নির্ভরযোগ্য করা আমাদের লক্ষ্য</h1><p className="text-base leading-8 text-gray-700">BD Job Apply সরকারি ও বেসরকারি চাকরির বিজ্ঞপ্তি খুঁজে পাওয়া, সিভি তথ্য গুছিয়ে রাখা এবং অনলাইন আবেদনের ধাপ বুঝতে প্রার্থীদের সহায়তা করে।</p></header>
    <section className="grid gap-4 md:grid-cols-3">
      {[{ icon: Target, title: 'সঠিক তথ্য', text: 'সার্কুলারের deadline, যোগ্যতা ও আবেদনের নির্দেশনা আগে পড়ে সিদ্ধান্ত নিন।' }, { icon: Users, title: 'প্রার্থী-কেন্দ্রিক সেবা', text: 'নতুন ব্যবহারকারী যেন account, CV ও application status সহজে বুঝতে পারেন।' }, { icon: ShieldCheck, title: 'নিরাপত্তা', text: 'PIN/OTP না দেওয়া এবং payment proof সঠিকভাবে সংরক্ষণের বিষয়ে আমরা সতর্ক করি।' }].map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><Icon className="h-6 w-6 text-emerald-700" aria-hidden="true" /><h2 className="mt-3 text-lg font-bold text-gray-950">{title}</h2><p className="mt-2 text-sm leading-7 text-gray-700">{text}</p></article>)}
    </section>
    <p className="rounded-2xl bg-gray-100 p-5 text-sm leading-7 text-gray-800">চাকরির চূড়ান্ত যোগ্যতা, সরকারি fee এবং deadline সবসময় মূল নিয়োগ বিজ্ঞপ্তি থেকে মিলিয়ে নিন। আমাদের সহায়তা কোনো সরকারি নিয়োগ কর্তৃপক্ষের বিকল্প নয়।</p>
    <Link to="/contact" className="inline-flex rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800">যোগাযোগ করুন</Link>
  </div>
);
