import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CreditCard, FileText, KeyRound, LogIn, UserPlus, WalletCards } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: 'নতুন অ্যাকাউন্ট তৈরি করুন', text: 'রেজিস্ট্রেশন পেজে মোবাইল নম্বর, নাম ও একটি নিরাপদ পাসওয়ার্ড দিয়ে অ্যাকাউন্ট খুলুন। নিজের নম্বরই ব্যবহার করুন, কারণ আবেদন আপডেট এই নম্বরে পৌঁছাতে পারে।' },
  { icon: LogIn, title: 'লগইন করুন', text: 'রেজিস্ট্রেশনের পর মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে লগইন করে ড্যাশবোর্ডে যান। পাসওয়ার্ড ভুলে গেলে Forgot Password অপশন ব্যবহার করুন।' },
  { icon: FileText, title: 'সিভি একবার সেভ করুন', text: 'ড্যাশবোর্ডের CV অংশে ব্যক্তিগত তথ্য, ঠিকানা, শিক্ষা, ছবি ও স্বাক্ষর পূরণ করুন। অসম্পূর্ণ তথ্য থাকলে আবেদন শুরুর আগে সিস্টেম আপনাকে জানাবে।' },
  { icon: CheckCircle2, title: 'চাকরি বেছে আবেদন শুরু করুন', text: 'সকল চাকরি থেকে পছন্দের সার্কুলার খুলে যোগ্যতা ও deadline মিলিয়ে “আবেদন করুন” বেছে নিন। প্রয়োজনীয় তথ্য দেখে আবেদন request জমা দিন।' },
  { icon: WalletCards, title: 'পেমেন্ট তথ্য পাঠান', text: 'আবেদন screen-এ দেখানো verified bKash/Rocket নম্বরে নির্দেশনা অনুযায়ী টাকা পাঠান। Transaction ID (TrxID) লিখুন এবং প্রয়োজন হলে পরিষ্কার screenshot দিন। PIN বা OTP কখনও দেবেন না।' },
  { icon: CreditCard, title: 'আবেদনের কপি যাচাই করুন', text: 'টিম আবেদন সম্পন্ন করলে dashboard-এ soft copy দেখুন। সব ঠিক থাকলে confirm করুন; ভুল থাকলে সংশোধনের নোট পাঠান। সরকারি fee ও service fee আলাদা হলে দুটির নির্দেশনা আলাদা করে দেখুন।' },
];

export const HowToApplyPage: React.FC = () => (
  <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
    <Helmet>
      <title>আবেদনের নিয়ম | BD Job Apply</title>
      <meta name="description" content="নতুন অ্যাকাউন্ট, লগইন, সিভি সেভ, চাকরিতে আবেদন, bKash/Rocket পেমেন্ট ও আবেদন যাচাই করার ধাপে ধাপে নিয়ম।" />
      <link rel="canonical" href="https://bdjobapply.site/how-to-apply" />
    </Helmet>

    <header className="max-w-3xl space-y-3">
      <p className="text-sm font-bold text-emerald-700">সহজ ধাপে আবেদন</p>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-950">নতুন অ্যাকাউন্ট থেকে আবেদন সম্পন্ন—পুরো নিয়ম</h1>
      <p className="text-base leading-8 text-gray-700">একবার সিভি পূরণ করে রাখলে পরের চাকরির আবেদনে সময় কম লাগে। নিচের ধাপগুলো অনুসরণ করুন এবং পেমেন্টের আগে সার্কুলারের নির্দেশনা ভালোভাবে মিলিয়ে নিন।</p>
    </header>

    <section className="grid gap-4 md:grid-cols-2" aria-label="আবেদনের ধাপসমূহ">
      {steps.map(({ icon: Icon, title, text }, index) => (
        <article key={title} className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white" aria-hidden="true"><Icon className="h-5 w-5" /></div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-700">ধাপ {index + 1}</p>
              <h2 className="text-lg font-bold text-gray-950">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-gray-700">{text}</p>
            </div>
          </div>
        </article>
      ))}
    </section>

    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5" aria-labelledby="payment-safety-title">
      <h2 id="payment-safety-title" className="flex items-center gap-2 text-lg font-bold text-amber-950"><KeyRound className="h-5 w-5" /> পেমেন্ট নিরাপত্তা</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-amber-950">
        <li>শুধু নির্বাচিত চাকরির application/payment screen-এ দেখানো verified নম্বরে টাকা পাঠাবেন।</li>
        <li>টাকা পাঠানোর পর TrxID সংরক্ষণ করে সঠিকভাবে লিখবেন; একই TrxID একাধিকবার ব্যবহার করবেন না।</li>
        <li>কাউকে PIN, OTP, password বা সম্পূর্ণ card তথ্য দেবেন না। সন্দেহ হলে আগে WhatsApp-এ যোগাযোগ করুন।</li>
      </ul>
    </section>

    <div className="flex flex-col gap-3 sm:flex-row">
      <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">অ্যাকাউন্ট তৈরি করুন <ArrowRight className="h-4 w-4" /></Link>
      <Link to="/jobs" className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">চাকরি দেখুন</Link>
    </div>
  </div>
);
