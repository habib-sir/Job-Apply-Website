import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CreditCard, FileText, KeyRound, Send, WalletCards } from 'lucide-react';

const steps = [
  { icon: FileText, title: 'সিভি একবার সেভ করুন', text: 'ড্যাশবোর্ডের CV অংশে ব্যক্তিগত তথ্য, ঠিকানা, শিক্ষা, ছবি ও স্বাক্ষর পূরণ করুন। অসম্পূর্ণ তথ্য থাকলে আবেদন শুরুর আগে সিস্টেম আপনাকে জানাবে।' },
  { icon: CheckCircle2, title: 'চাকরি ও পদ বেছে আবেদন শুরু করুন', text: 'সার্কুলারে আমাদের মাধ্যমে আবেদন চালু আছে কি না, যোগ্যতা, পদ, আবেদন শুরুর তারিখ ও deadline মিলিয়ে নির্দিষ্ট পদ নির্বাচন করুন।' },
  { icon: WalletCards, title: 'Teletalk fee ও service fee দেখুন', text: 'পদভেদে সরকারি Teletalk fee এবং BD Job Apply service fee (সাধারণত ১০–২০ টাকা) আলাদা করে দেখানো হবে। payment দেওয়ার আগে মোট amount মিলিয়ে নিন।' },
  { icon: WalletCards, title: 'bKash, Rocket বা Nagad-এ payment পাঠান', text: 'Application screen-এ দেখানো verified নম্বরে Send Money করুন। TrxID লিখুন এবং প্রয়োজন হলে screenshot দিন। PIN, OTP বা password কখনও দেবেন না।' },
  { icon: CreditCard, title: 'Waiting থেকে payment verification', text: 'আমাদের team bKash, Rocket বা Nagad payment যাচাই করে request approve করবে। যাচাই চলাকালে dashboard-এ Waiting status দেখা যাবে।' },
  { icon: Send, title: 'Apply: আপনার হয়ে form পূরণ', text: 'Payment approve হলে সংরক্ষিত CV ও নির্বাচিত পদের তথ্য ব্যবহার করে team official Teletalk বা নির্দিষ্ট portal-এ আপনার হয়ে application প্রস্তুত করবে।' },
  { icon: FileText, title: 'Check: PDF proof যাচাই করুন', text: 'আবেদন form পূরণ হলে dashboard-এ soft copy/PDF proof পাঠানো হবে। নাম, জন্মতারিখ, শিক্ষা, ছবি, স্বাক্ষর, পদ ও জেলা ভালোভাবে যাচাই করুন।' },
  { icon: CheckCircle2, title: 'Complete: অনুমোদনের পর paid copy', text: 'তথ্য সঠিক হলে confirm করুন। আপনার অনুমোদনের পর Teletalk fee payment করা হবে; Teletalk-এর User ID/password SMS এবং paid application copy আপনাকে দেওয়া হবে।' },
  { icon: FileText, title: 'Correction: ভুল থাকলে সংশোধন', text: 'PDF proof-এ কোনো ভুল থাকলে confirm না করে correction note পাঠান। Application আবার Apply ধাপে যাবে এবং সংশোধনের পর নতুন proof আপনাকে দেখানো হবে।' },
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
      <p className="text-base leading-8 text-gray-700">একবার CV সংরক্ষণ করে নির্দিষ্ট চালু থাকা চাকরিতে আমাদের সহায়তায় আবেদন করতে পারবেন। Payment verification, application proof check এবং আপনার অনুমোদনের পর final Teletalk payment করা হয়।</p>
    </header>

    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5" aria-labelledby="service-scope-title">
      <h2 id="service-scope-title" className="text-lg font-bold text-emerald-950">সব বিজ্ঞপ্তিতে আমাদের মাধ্যমে আবেদন চালু থাকে না</h2>
      <p className="mt-2 text-sm leading-7 text-emerald-950">যেসব চাকরিতে service চালু, সেগুলোতে “সরকারি আবেদন সেবা চালু” বা “অন্যান্য আবেদন সেবা চালু” লেখা থাকবে। service বন্ধ থাকলে আপনি শুধু circular, যোগ্যতা, আবেদন শুরুর তারিখ, deadline এবং official application link দেখতে পারবেন।</p>
    </section>

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

    <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5" aria-labelledby="status-title">
      <h2 id="status-title" className="text-lg font-bold text-gray-950">Application status-এর অর্থ</h2>
      <p className="mt-2 text-sm leading-7 text-gray-700"><strong>Waiting:</strong> payment যাচাই চলছে। <strong>Apply:</strong> team application প্রস্তুত করছে। <strong>Check:</strong> PDF proof আপনার যাচাইয়ের অপেক্ষায়। <strong>Complete:</strong> final payment ও paid copy দেওয়া হয়েছে। ভুল থাকলে সংশোধনের জন্য request আবার Apply ধাপে যেতে পারে।</p>
    </section>

    <div className="flex flex-col gap-3 sm:flex-row">
      <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">অ্যাকাউন্ট তৈরি করুন <ArrowRight className="h-4 w-4" /></Link>
      <Link to="/jobs" className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">চাকরি দেখুন</Link>
    </div>
  </div>
);
