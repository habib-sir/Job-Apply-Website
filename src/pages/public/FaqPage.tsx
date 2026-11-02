import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ShieldCheck } from 'lucide-react';
import { faqItems } from '../../data/faq';

export const FaqPage: React.FC = () => {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <Helmet>
        <title>সচরাচর জিজ্ঞাসিত প্রশ্ন | চাকরির আবেদন সহায়তা | BD Job Apply</title>
        <meta name="description" content="BD Job Apply-এর online চাকরির আবেদন সহায়তা, Teletalk fee, service fee, payment verification, PDF proof, correction এবং application status সম্পর্কে সাধারণ প্রশ্নের উত্তর।" />
        <link rel="canonical" href="https://bdjobapply.site/faq/" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <header className="max-w-3xl space-y-3">
        <p className="text-sm font-bold text-emerald-700">সহায়তা ও স্বচ্ছতা</p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-950">সচরাচর জিজ্ঞাসিত প্রশ্ন</h1>
        <p className="text-base leading-8 text-gray-700">চাকরির আবেদন সহায়তা, payment verification, application proof এবং service fee সম্পর্কে সবচেয়ে সাধারণ প্রশ্নগুলোর উত্তর এখানে একসাথে দেওয়া হয়েছে।</p>
      </header>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5" aria-labelledby="faq-service-title">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" aria-hidden="true" />
          <div>
            <h2 id="faq-service-title" className="font-bold text-emerald-950">স্বচ্ছ application assistance</h2>
            <p className="mt-1 text-sm leading-7 text-emerald-950">যে বিজ্ঞপ্তিতে service চালু থাকে, সেখানেই আপনার হয়ে application প্রস্তুত করা হয়। PDF proof আপনি যাচাই ও অনুমোদন করার পর final Teletalk payment করা হয়।</p>
          </div>
        </div>
      </section>

      <section className="space-y-3" aria-label="সাধারণ প্রশ্ন ও উত্তর">
        {faqItems.map(({ question, answer }) => (
          <details key={question} className="group rounded-2xl border border-gray-200 bg-white shadow-sm open:border-emerald-300 open:shadow-md">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-gray-900 marker:hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100">
              <span>{question}</span>
              <ChevronDown className="h-5 w-5 shrink-0 text-emerald-700 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="border-t border-gray-100 px-5 pb-5 pt-3 text-sm leading-7 text-gray-700">{answer}</div>
          </details>
        ))}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h2 className="font-bold text-gray-950">আরও জানতে চান?</h2>
        <p className="mt-1 text-sm leading-7 text-gray-700">সম্পূর্ণ workflow দেখতে আবেদনের নিয়ম পড়ুন অথবা নির্দিষ্ট circular-এর service status ও fee breakdown দেখে আবেদন শুরু করুন।</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link to="/how-to-apply" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">আবেদনের নিয়ম <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/jobs" className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 hover:bg-gray-100">চাকরি দেখুন</Link>
        </div>
      </section>
    </div>
  );
};
