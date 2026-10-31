import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, Users } from 'lucide-react';

export const AboutPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
    <Helmet><title>আমাদের সম্পর্কে | অনলাইন চাকরির আবেদন সহায়তা | BD Job Apply</title><meta name="description" content="BD Job Apply কীভাবে CV সংরক্ষণ, payment verification ও ব্যবহারকারীর অনুমোদনের পর নির্দিষ্ট চাকরিতে online application সহায়তা করে তা জানুন।" /><link rel="canonical" href="https://bdjobapply.site/about/" /></Helmet>
    <header className="space-y-3"><p className="text-sm font-bold text-emerald-700">আমাদের সম্পর্কে</p><h1 className="text-3xl font-extrabold text-gray-950">চাকরির আবেদনকে সহজ, পরিষ্কার ও নির্ভরযোগ্য করা আমাদের লক্ষ্য</h1><p className="text-base leading-8 text-gray-700">BD Job Apply একটি private online job application assistance platform। ব্যবহারকারীরা account-এ CV সংরক্ষণ করে নির্দিষ্ট চালু থাকা সরকারি, বেসরকারি ও NGO চাকরিতে আমাদের সহায়তায় online application সম্পন্ন করতে পারেন।</p></header>
    <section className="grid gap-4 md:grid-cols-3">
      {[{ icon: Target, title: 'সঠিক তথ্য', text: 'সার্কুলারের deadline, যোগ্যতা, পদ, সরকারি fee ও official application link আগে মিলিয়ে সিদ্ধান্ত নিন।' }, { icon: Users, title: 'ধাপে ধাপে সহায়তা', text: 'CV save, payment verification, Apply, PDF Check এবং user approval-এর পর Complete status—প্রতিটি ধাপ dashboard-এ বোঝানো হয়।' }, { icon: ShieldCheck, title: 'নিরাপত্তা ও স্বচ্ছতা', text: 'Teletalk fee ও service fee আলাদা দেখানো হয়। PIN, OTP বা password না দেওয়া এবং payment proof সংরক্ষণের বিষয়ে আমরা সতর্ক করি।' }].map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><Icon className="h-6 w-6 text-emerald-700" aria-hidden="true" /><h2 className="mt-3 text-lg font-bold text-gray-950">{title}</h2><p className="mt-2 text-sm leading-7 text-gray-700">{text}</p></article>)}
    </section>
    <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-800">
      <h2 className="font-bold text-gray-950">আমাদের service কীভাবে কাজ করে?</h2>
      <p className="mt-2">ব্যবহারকারী পছন্দের circular ও পদ নির্বাচন করে Teletalk fee এবং আমাদের পদভিত্তিক service fee প্রদান করেন। Payment যাচাইয়ের পর team application প্রস্তুত করে PDF proof পাঠায়। ব্যবহারকারী তথ্য সঠিক বলে অনুমোদন করলে final Teletalk payment করা হয় এবং User ID/password SMS ও paid copy দেওয়া হয়। ভুল থাকলে সংশোধনের জন্য application আবার Apply ধাপে পাঠানো যায়।</p>
      <p className="mt-3 font-semibold">BD Job Apply কোনো সরকারি website নয় এবং চাকরি, selection বা নিয়োগের নিশ্চয়তা দেয় না। আমরা শুধু নির্দিষ্ট চালু থাকা official portal-এ application assistance প্রদান করি।</p>
    </section>
    <Link to="/contact" className="inline-flex rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800">যোগাযোগ করুন</Link>
  </div>
);
