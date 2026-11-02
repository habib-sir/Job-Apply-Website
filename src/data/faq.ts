export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: 'BD Job Apply কী?',
    answer: 'BD Job Apply সরকারি ও অন্যান্য চাকরির জন্য একটি স্বাধীন, স্বচ্ছ এবং প্রার্থী-কেন্দ্রিক online application assistance platform। ব্যবহারকারী CV সংরক্ষণ করে নির্দিষ্ট চালু থাকা চাকরিতে application assistance নিতে পারেন।',
  },
  {
    question: 'আপনারা কি আমার হয়ে চাকরির আবেদন করেন?',
    answer: 'হ্যাঁ। যেসব বিজ্ঞপ্তিতে application service চালু থাকে, payment verification-এর পর আমাদের team আপনার দেওয়া তথ্য ও সংরক্ষিত CV ব্যবহার করে আপনার হয়ে online application প্রস্তুত করে।',
  },
  {
    question: 'সব চাকরিতে কি আপনাদের application service চালু থাকে?',
    answer: 'না। সব বিজ্ঞপ্তিতে service চালু থাকে না। Job details page-এ আবেদন সেবা চালু আছে কি না দেখা যাবে। Service বন্ধ থাকলেও circular, যোগ্যতা, deadline এবং official application link দেখা যাবে।',
  },
  {
    question: 'Application-এর ধাপগুলো কী?',
    answer: 'CV Save → Job Select → Fee View → Payment → Waiting → Apply → Check → Complete। PDF proof-এ ভুল থাকলে Correction request দিয়ে application আবার Apply ধাপে পাঠানো যায়।',
  },
  {
    question: 'Teletalk fee এবং service fee কি আলাদা?',
    answer: 'হ্যাঁ। সরকারি Teletalk application fee এবং BD Job Apply service fee আলাদাভাবে দেখানো হয়। Payment করার আগে পদভিত্তিক fee breakdown ও মোট amount দেখে নিন।',
  },
  {
    question: 'কোন payment method গ্রহণ করা হয়?',
    answer: 'নির্দিষ্ট application page-এ নির্দেশিত verified bKash, Rocket বা Nagad নম্বরে Send Money করতে হবে। Payment করার পর TrxID সংরক্ষণ করে জমা দিতে হবে।',
  },
  {
    question: 'Payment করার পর Waiting status কেন দেখা যায়?',
    answer: 'Payment verification শেষ না হওয়া পর্যন্ত Waiting status থাকে। Verification সম্পন্ন হলে application request approve করে Apply ধাপে নেওয়া হয়।',
  },
  {
    question: 'Application submit করার আগে কি PDF দেখতে পারব?',
    answer: 'হ্যাঁ। Team application প্রস্তুত করার পর Check ধাপে soft copy বা PDF proof দেওয়া হয়। আপনি নাম, জন্মতারিখ, পদ, জেলা, ছবি, স্বাক্ষর ও অন্যান্য তথ্য যাচাই করতে পারবেন।',
  },
  {
    question: 'PDF-তে ভুল থাকলে কী করব?',
    answer: 'Complete বা confirm না করে Correction request পাঠাতে হবে। সংশোধনের পর application আবার Apply ধাপে যাবে এবং নতুন proof আপনাকে দেখানো হবে।',
  },
  {
    question: 'Final Teletalk fee কখন জমা দেওয়া হয়?',
    answer: 'আপনি PDF proof দেখে তথ্য সঠিক বলে অনুমোদন দেওয়ার পর final Teletalk fee payment করা হয়। এরপর Teletalk User ID/password SMS এবং paid application copy দেওয়া হয়।',
  },
  {
    question: 'আপনারা কি চাকরি পাওয়ার নিশ্চয়তা দেন?',
    answer: 'না। BD Job Apply application assistance প্রদান করে। চাকরির selection, পরীক্ষা, ফলাফল ও নিয়োগ সংশ্লিষ্ট কর্তৃপক্ষের নিজস্ব প্রক্রিয়া ও সিদ্ধান্তের ওপর নির্ভরশীল।',
  },
  {
    question: 'আমার PIN, OTP বা password কি দিতে হবে?',
    answer: 'না। কোনো staff বা representative-কে bKash, Rocket বা Nagad PIN, OTP, account password অথবা sensitive banking information দেবেন না।',
  },
  {
    question: 'CV কি পরে update করা যাবে?',
    answer: 'হ্যাঁ। Account-এ সংরক্ষিত CV পরবর্তীতে update করা যায়। নতুন application করার আগে তথ্যগুলো সঠিক আছে কি না যাচাই করুন।',
  },
  {
    question: 'কোন জেলার প্রার্থীরা আবেদন করতে পারবেন?',
    answer: 'প্রতিটি বিজ্ঞপ্তি ও পদের eligibility আলাদা হতে পারে। Job details page-এর “আবেদনের অনুমোদিত জেলা” অংশে সারাদেশ অথবা নির্দিষ্ট জেলা উল্লেখ থাকবে।',
  },
];
