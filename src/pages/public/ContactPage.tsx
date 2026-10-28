import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Phone } from 'lucide-react';

const WHATSAPP = '8801771522503';
const PHONE = '01771522503';

export const ContactPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
    <Helmet><title>যোগাযোগ | BD Job Apply</title><meta name="description" content="BD Job Apply support team-এর সঙ্গে WhatsApp বা ফোনে যোগাযোগ করুন।" /><link rel="canonical" href="https://bdjobapply.site/contact" /></Helmet>
    <header className="space-y-3"><p className="text-sm font-bold text-emerald-700">যোগাযোগ</p><h1 className="text-3xl font-extrabold text-gray-950">আবেদন বা পেমেন্ট নিয়ে সাহায্য দরকার?</h1><p className="text-base leading-8 text-gray-700">আপনার নাম, নির্বাচিত চাকরির নাম এবং সমস্যার সংক্ষিপ্ত বিবরণ লিখে যোগাযোগ করুন। কখনও PIN, OTP বা password পাঠাবেন না।</p></header>
    <div className="grid gap-4 sm:grid-cols-2">
      <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('আসসালামু আলাইকুম, চাকরির আবেদন সম্পর্কে সাহায্য চাই।')}`} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-green-200 bg-green-50 p-5 hover:border-green-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-200"><MessageCircle className="h-7 w-7 text-green-700" aria-hidden="true" /><h2 className="mt-3 text-lg font-bold text-gray-950">WhatsApp support</h2><p className="mt-1 text-sm text-gray-700">+880 1771-522503</p></a>
      <a href={`tel:${PHONE}`} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 hover:border-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"><Phone className="h-7 w-7 text-emerald-700" aria-hidden="true" /><h2 className="mt-3 text-lg font-bold text-gray-950">ফোন করুন</h2><p className="mt-1 text-sm text-gray-700">{PHONE}</p></a>
    </div>
  </div>
);
